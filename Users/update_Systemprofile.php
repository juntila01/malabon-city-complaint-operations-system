<?php

error_reporting(E_ALL);
ini_set('display_errors', 1);

session_start();

header("Content-Type: application/json");

require_once "../db.php";
require_once "../Reports/log_operation.php";


/* =========================================================
   RESPONSE HELPER
   ========================================================= */

function respond(
    $success,
    $message = "",
    $user = null,
    $statusCode = 200
) {

    http_response_code($statusCode);

    echo json_encode([
        "success" => $success,
        "message" => $message,
        "user" => $user
    ]);

    exit;
}


/* =========================================================
   CHECK LOGIN
   ========================================================= */

if (
    !isset($_SESSION['logged_in']) ||
    $_SESSION['logged_in'] !== true
) {

    respond(
        false,
        "You are not logged in.",
        null,
        401
    );

}


/* =========================================================
   CHECK SYSTEM USER
   ========================================================= */

if (
    !isset($_SESSION['user_type']) ||
    $_SESSION['user_type'] !== 'system'
) {

    respond(
        false,
        "This profile is only available for system users.",
        null,
        403
    );

}


/* =========================================================
   GET SYSTEM USER ID
   ========================================================= */

if (!isset($_SESSION['user_id'])) {

    respond(
        false,
        "System user ID was not found in the session.",
        null,
        401
    );

}

$systemUsersID =
    (int) $_SESSION['user_id'];


/* =========================================================
   ONLY POST ALLOWED
   ========================================================= */

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {

    respond(
        false,
        "Invalid request method.",
        null,
        405
    );

}


/* =========================================================
   GET NAME
   ========================================================= */

$name =
    isset($_POST['name'])
        ? trim($_POST['name'])
        : "";


if ($name === "") {

    respond(
        false,
        "Full name is required.",
        null,
        400
    );

}


if (mb_strlen($name) < 2) {

    respond(
        false,
        "Please enter a valid full name.",
        null,
        400
    );

}


if (mb_strlen($name) > 100) {

    respond(
        false,
        "Name must not exceed 100 characters.",
        null,
        400
    );

}


/* =========================================================
   PROFILE PICTURE
   ========================================================= */

$profilePicturePath = null;

$hasNewPicture =
    isset($_FILES['profilePicture']) &&
    $_FILES['profilePicture']['error'] !== UPLOAD_ERR_NO_FILE;


if ($hasNewPicture) {

    $file =
        $_FILES['profilePicture'];


    /* -----------------------------------------
       CHECK UPLOAD ERROR
       ----------------------------------------- */

    if (
        $file['error'] !== UPLOAD_ERR_OK
    ) {

        respond(
            false,
            "Failed to upload profile picture.",
            null,
            400
        );

    }


    /* -----------------------------------------
       MAX 5MB
       ----------------------------------------- */

    if (
        $file['size'] > 5 * 1024 * 1024
    ) {

        respond(
            false,
            "Profile picture must not exceed 5MB.",
            null,
            400
        );

    }


    /* -----------------------------------------
       MIME TYPE
       ----------------------------------------- */

    $allowedTypes = [
        'image/jpeg' => 'jpg',
        'image/png'  => 'png',
        'image/webp' => 'webp'
    ];


    $finfo =
        new finfo(FILEINFO_MIME_TYPE);


    $mime =
        $finfo->file($file['tmp_name']);


    if (!isset($allowedTypes[$mime])) {

        respond(
            false,
            "Only JPG, PNG, and WebP images are allowed.",
            null,
            400
        );

    }


    /* -----------------------------------------
       UPLOAD DIRECTORY
       ----------------------------------------- */

    $uploadDir =
        __DIR__ . "/../uploads/profile/";

    
    if (!is_dir($uploadDir)) {

        if (
            !mkdir(
                $uploadDir,
                0755,
                true
            )
        ) {

            respond(
                false,
                "Unable to create profile upload directory.",
                null,
                500
            );

        }

    }


    /* -----------------------------------------
       GENERATE SAFE FILE NAME
       ----------------------------------------- */

    $extension =
        $allowedTypes[$mime];


    $fileName =
        "profile_" .
        $systemUsersID .
        "_" .
        time() .
        "." .
        $extension;


    $destination =
        $uploadDir . $fileName;


    /* -----------------------------------------
       MOVE FILE
       ----------------------------------------- */

    if (
        !move_uploaded_file(
            $file['tmp_name'],
            $destination
        )
    ) {

        respond(
            false,
            "Unable to save profile picture.",
            null,
            500
        );

    }


    /*
     * Browser-accessible path
     */
    $profilePicturePath =
        "/Complaint/Users/uploads/profile/" .
        $fileName;

}


/* =========================================================
   UPDATE DATABASE
   ========================================================= */

try {

    if ($profilePicturePath !== null) {

        $sql = "
            UPDATE tbl_systemusers
            SET
                name = :name,
                profilePicture = :profilePicture
            WHERE systemUsersID = :systemUsersID
        ";

        $stmt =
            $pdo->prepare($sql);

        $stmt->execute([
            "name" =>
                $name,

            "profilePicture" =>
                $profilePicturePath,

            "systemUsersID" =>
                $systemUsersID
        ]);

    }
    else {

        $sql = "
            UPDATE tbl_systemusers
            SET
                name = :name
            WHERE systemUsersID = :systemUsersID
        ";

        $stmt =
            $pdo->prepare($sql);

        $stmt->execute([
            "name" =>
                $name,

            "systemUsersID" =>
                $systemUsersID
        ]);

    }


    /* =====================================================
       GET UPDATED PROFILE
       ===================================================== */

    $sql = "
        SELECT
            systemUsersID,
            name,
            email,
            role,
            department,
            profilePicture,
            createdAt
        FROM tbl_systemusers
        WHERE systemUsersID = :systemUsersID
        LIMIT 1
    ";


    $stmt =
        $pdo->prepare($sql);


    $stmt->execute([
        "systemUsersID" =>
            $systemUsersID
    ]);


    $user =
        $stmt->fetch(PDO::FETCH_ASSOC);


    if (!$user) {

        respond(
            false,
            "Profile was updated but could not be loaded.",
            null,
            500
        );

    }


    /* =====================================================
       SUCCESS
       ===================================================== */

    respond(
        true,
        "Profile updated successfully.",
        [
            "systemUsersID" =>
                $user["systemUsersID"],

            "name" =>
                $user["name"],

            "email" =>
                $user["email"],

            "role" =>
                $user["role"],

            "department" =>
                $user["department"],

            "profilePicture" =>
                $user["profilePicture"],

            "createdAt" =>
                $user["createdAt"]
        ]
    );

}
catch (Throwable $e) {

    error_log(
        "update_Systemprofile.php: " .
        $e->getMessage()
    );

    respond(
        false,
        "An error occurred while updating your profile.",
        null,
        500
    );

}
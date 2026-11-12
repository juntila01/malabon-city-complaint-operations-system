<?php

error_reporting(E_ALL);
ini_set('display_errors', 1);

session_start();

header("Content-Type: application/json");

require_once "../db.php";


/* =========================================================
   RESPONSE HELPER
   ========================================================= */

function respond($success, $message = "", $user = null, $statusCode = 200)
{
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


$systemUsersID = (int) $_SESSION['user_id'];


/* =========================================================
   GET PROFILE
   ========================================================= */

try {

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


    $stmt = $pdo->prepare($sql);


    $stmt->execute([
        "systemUsersID" => $systemUsersID
    ]);


    $user = $stmt->fetch(PDO::FETCH_ASSOC);


    if (!$user) {

        respond(
            false,
            "System user profile not found.",
            null,
            404
        );

    }


    /* =====================================================
       RETURN PROFILE
       ===================================================== */

    respond(
        true,
        "Profile loaded successfully.",
        [
            "systemUsersID" => $user["systemUsersID"],
            "name" => $user["name"],
            "email"         => $user["email"],
            "role"          => $user["role"],
            "department"    => $user["department"],
            "profilePicture" => !empty($user["profilePicture"])
                ? "/Complaint/uploads/profile/" . basename($user["profilePicture"])
                : null,
            "createdAt"     => $user["createdAt"]
        ]
    );

}
catch (Throwable $e) {

    error_log(
        "get_Systemprofile.php: " .
        $e->getMessage()
    );

    respond(
        false,
        "An error occurred while loading your profile.",
        null,
        500
    );

}
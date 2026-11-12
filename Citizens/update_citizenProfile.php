<?php

header("Content-Type: application/json");

session_start();

require_once "../db.php";

try {

    /* =========================================================
       CHECK CITIZEN LOGIN
    ========================================================= */

    if (
        !isset($_SESSION['logged_in']) ||
        $_SESSION['logged_in'] !== true ||
        !isset($_SESSION['user_type']) ||
        $_SESSION['user_type'] !== 'citizen' ||
        !isset($_SESSION['user_id'])
    ) {

        http_response_code(401);

        echo json_encode([
            "success" => false,
            "message" => "You are not logged in as a citizen."
        ]);

        exit;
    }


    /* =========================================================
       CITIZEN ID
    ========================================================= */

    $citizenID = (int) $_SESSION['user_id'];


    /* =========================================================
       GET NAME
    ========================================================= */

    $fullName = trim($_POST['fullName'] ?? '');

    if ($fullName === '') {

        http_response_code(400);

        echo json_encode([
            "success" => false,
            "message" => "Full name is required."
        ]);

        exit;
    }


    if (mb_strlen($fullName) < 2) {

        http_response_code(400);

        echo json_encode([
            "success" => false,
            "message" => "Full name must contain at least 2 characters."
        ]);

        exit;
    }


    /* =========================================================
       GET CURRENT PROFILE
    ========================================================= */

    $stmt = $pdo->prepare("
        SELECT profileImage
        FROM tbl_citizens
        WHERE citizenID = ?
        LIMIT 1
    ");

    $stmt->execute([$citizenID]);

    $currentProfile = $stmt->fetch(PDO::FETCH_ASSOC);


    if (!$currentProfile) {

        http_response_code(404);

        echo json_encode([
            "success" => false,
            "message" => "Citizen account not found."
        ]);

        exit;
    }


    $oldProfileImage =
        $currentProfile['profileImage'] ?? null;


    $newProfileImage = $oldProfileImage;


    /* =========================================================
       PROFILE IMAGE UPLOAD
    ========================================================= */

    if (
        isset($_FILES['profileImage']) &&
        $_FILES['profileImage']['error'] !== UPLOAD_ERR_NO_FILE
    ) {

        $file = $_FILES['profileImage'];


        /* -----------------------------------------------------
           UPLOAD ERROR
        ----------------------------------------------------- */

        if ($file['error'] !== UPLOAD_ERR_OK) {

            http_response_code(400);

            echo json_encode([
                "success" => false,
                "message" => "Profile image upload failed.",
                "uploadError" => $file['error']
            ]);

            exit;
        }


        /* -----------------------------------------------------
           FILE SIZE
        ----------------------------------------------------- */

        $maxSize = 5 * 1024 * 1024; // 5MB

        if ($file['size'] > $maxSize) {

            http_response_code(400);

            echo json_encode([
                "success" => false,
                "message" => "Profile image must not exceed 5MB."
            ]);

            exit;
        }


        /* -----------------------------------------------------
           VERIFY MIME TYPE
        ----------------------------------------------------- */

        $allowedMimeTypes = [
            'image/jpeg' => 'jpg',
            'image/png'  => 'png',
            'image/webp' => 'webp'
        ];


        $finfo =
            new finfo(FILEINFO_MIME_TYPE);

        $mimeType =
            $finfo->file($file['tmp_name']);


        if (!isset($allowedMimeTypes[$mimeType])) {

            http_response_code(400);

            echo json_encode([
                "success" => false,
                "message" => "Invalid profile image type. Only JPG, PNG, and WEBP are allowed."
            ]);

            exit;
        }


        $extension =
            $allowedMimeTypes[$mimeType];


        /* =====================================================
           PROFILE UPLOAD DIRECTORY
        ===================================================== */

        /*
         * This file is inside:
         *
         * Complaint/Citizens/update_citizenProfile.php
         *
         * So:
         *
         * dirname(__DIR__)
         *
         * points to:
         *
         * Complaint/
         *
         * Then we create:
         *
         * Complaint/uploads/profile/
         */

        $uploadDirectory =
            dirname(__DIR__) .
            DIRECTORY_SEPARATOR .
            'uploads' .
            DIRECTORY_SEPARATOR .
            'profile' .
            DIRECTORY_SEPARATOR;


        /* -----------------------------------------------------
           CREATE DIRECTORY IF NEEDED
        ----------------------------------------------------- */

        if (!is_dir($uploadDirectory)) {

            if (!mkdir(
                $uploadDirectory,
                0755,
                true
            )) {

                http_response_code(500);

                echo json_encode([
                    "success" => false,
                    "message" => "Unable to create profile upload directory."
                ]);

                exit;
            }
        }


        /* -----------------------------------------------------
           GENERATE SAFE UNIQUE FILE NAME
        ----------------------------------------------------- */

        $fileName =
            'citizen_' .
            $citizenID .
            '_' .
            bin2hex(random_bytes(8)) .
            '.' .
            $extension;


        $destination =
            $uploadDirectory .
            $fileName;


        /* -----------------------------------------------------
           MOVE UPLOADED FILE
        ----------------------------------------------------- */

        if (!move_uploaded_file(
            $file['tmp_name'],
            $destination
        )) {

            http_response_code(500);

            echo json_encode([
                "success" => false,
                "message" => "Unable to save profile image."
            ]);

            exit;
        }


        /* =====================================================
           DATABASE PATH
        ===================================================== */

        /*
         * Browser URL:
         *
         * /Complaint/uploads/profile/filename.jpg
         */

        $newProfileImage =
            'Complaint/uploads/profile/' .
            $fileName;


        /* =====================================================
           DELETE OLD PROFILE IMAGE
        ===================================================== */

        if (
            !empty($oldProfileImage) &&
            $oldProfileImage !== $newProfileImage
        ) {

            /*
             * Convert database path into filesystem path.
             */

            $oldPath =
                ltrim(
                    $oldProfileImage,
                    '/'
                );


            /*
             * If database contains:
             *
             * Complaint/uploads/profile/xxx.jpg
             *
             * dirname(__DIR__) already points to Complaint,
             * so remove "Complaint/".
             */

            if (
                strpos(
                    $oldPath,
                    'Complaint/'
                ) === 0
            ) {

                $oldPath =
                    substr(
                        $oldPath,
                        strlen('Complaint/')
                    );
            }


            $oldFile =
                dirname(__DIR__) .
                DIRECTORY_SEPARATOR .
                str_replace(
                    '/',
                    DIRECTORY_SEPARATOR,
                    $oldPath
                );


            if (
                is_file($oldFile)
            ) {

                @unlink($oldFile);

            }

        }

    }


    /* =========================================================
       UPDATE DATABASE
    ========================================================= */

    $stmt = $pdo->prepare("
        UPDATE tbl_citizens
        SET
            fullName = ?,
            profileImage = ?
        WHERE citizenID = ?
    ");


    $stmt->execute([
        $fullName,
        $newProfileImage,
        $citizenID
    ]);


    /* =========================================================
       SUCCESS
    ========================================================= */

    echo json_encode([

        "success" => true,

        "message" =>
            "Profile updated successfully.",

        "data" => [

            "citizenID" =>
                $citizenID,

            "fullName" =>
                $fullName,

            "profileImage" =>
                $newProfileImage

        ]

    ]);

}
catch (PDOException $e) {

    http_response_code(500);

    echo json_encode([

        "success" => false,

        "message" =>
            "Database error.",

        "error" =>
            $e->getMessage()

    ]);

}
catch (Throwable $e) {

    http_response_code(500);

    echo json_encode([

        "success" => false,

        "message" =>
            "Server error.",

        "error" =>
            $e->getMessage()

    ]);

}
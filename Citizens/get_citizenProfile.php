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
       GET CITIZEN ID FROM SESSION
    ========================================================= */

    $citizenID = (int)$_SESSION['user_id'];


    /* =========================================================
       GET CITIZEN PROFILE
    ========================================================= */

    $stmt = $pdo->prepare("
        SELECT
            citizenID,
            fullName,
            email,
            contactNumber,
            verificationStatus,
            createdAt,
            profileImage
        FROM tbl_citizens
        WHERE citizenID = ?
        LIMIT 1
    ");

    $stmt->execute([$citizenID]);

    $citizen = $stmt->fetch(PDO::FETCH_ASSOC);


    /* =========================================================
       CITIZEN NOT FOUND
    ========================================================= */

    if (!$citizen) {

        http_response_code(404);

        echo json_encode([
            "success" => false,
            "message" => "Citizen account not found."
        ]);

        exit;
    }


    /* =========================================================
       PROFILE IMAGE
    ========================================================= */

    if (!empty($citizen['profileImage'])) {

        /*
         * Stored path example:
         *
         * uploads/profile/15_123456.jpg
         *
         * Convert it into a browser-accessible path.
         */

        $imagePath = ltrim($citizen['profileImage'], '/');

        if (strpos($imagePath, 'Complaint/') === 0) {

            $citizen['profileImage'] = '/' . $imagePath;

        } else {

            $citizen['profileImage'] = '/Complaint/' . $imagePath;

        }

    } else {

        $citizen['profileImage'] = null;

    }


    /* =========================================================
       SUCCESS
    ========================================================= */

    echo json_encode([
        "success" => true,
        "data" => $citizen
    ]);

}
catch (PDOException $e) {

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Database error.",
        "error" => $e->getMessage()
    ]);

}
catch (Throwable $e) {

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Server error.",
        "error" => $e->getMessage()
    ]);

}
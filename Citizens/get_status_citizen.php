<?php

session_start();

header("Content-Type: application/json");

require_once "../db.php";


/* =========================================================
   CHECK CITIZEN LOGIN
========================================================= */

if (
    empty($_SESSION['logged_in']) ||
    ($_SESSION['user_type'] ?? '') !== 'citizen' ||
    empty($_SESSION['user_id'])
) {

    http_response_code(401);

    echo json_encode([
        "success" => false,
        "error" => "Unauthorized"
    ]);

    exit;
}


try {

    /* =========================================================
       GET CITIZEN
    ========================================================= */

    $stmt = $pdo->prepare("

        SELECT

            fullName,
            verificationStatus,
            attachment,
            emergencyComplaintUsed

        FROM tbl_citizens

        WHERE citizenID = ?

        LIMIT 1

    ");

    $stmt->execute([
        $_SESSION['user_id']
    ]);


    $citizen =
        $stmt->fetch(PDO::FETCH_ASSOC);


    /* =========================================================
       CITIZEN NOT FOUND
    ========================================================= */

    if (!$citizen) {

        http_response_code(404);

        echo json_encode([
            "success" => false,
            "error" => "Citizen not found"
        ]);

        exit;

    }


    /* =========================================================
       RESPONSE
    ========================================================= */

    echo json_encode([

        "success" => true,

        "fullName" =>
            $citizen['fullName'],

        "status" =>
            strtolower(
                $citizen['verificationStatus']
            ),

        "attachment" =>
            $citizen['attachment'],

        "emergencyComplaintUsed" =>
            (int)$citizen['emergencyComplaintUsed']

    ]);

}
catch (PDOException $e) {

    http_response_code(500);

    echo json_encode([

        "success" => false,

        "error" => "Database error."

        // During development you can temporarily add:
        // "details" => $e->getMessage()

    ]);

}
catch (Throwable $e) {

    http_response_code(500);

    echo json_encode([

        "success" => false,

        "error" => "Server error."

    ]);

}
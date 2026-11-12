<?php

header("Content-Type: application/json");

session_start();

require_once "../db.php";


function jsonResponse(
    bool $success,
    string $message = ""
) {

    echo json_encode([
        "success" => $success,
        "message" => $message
    ]);

    exit;
}


/* ============================================================
   CHECK LOGIN
============================================================ */

if (
    !isset($_SESSION["logged_in"]) ||
    $_SESSION["logged_in"] !== true
) {

    jsonResponse(
        false,
        "You are not logged in."
    );

}


/* ============================================================
   GET CITIZEN
============================================================ */

$citizenID =
    $_SESSION["citizenID"]
    ?? $_SESSION["citizen_id"]
    ?? $_SESSION["user_id"]
    ?? null;


if (!$citizenID) {

    jsonResponse(
        false,
        "Citizen session could not be identified."
    );

}


try {

    $stmt = $pdo->prepare("
        UPDATE tbl_notifications

        SET
            isRead = 1

        WHERE citizenID = ?
          AND isRead = 0
    ");


    $stmt->execute([
        $citizenID
    ]);


    jsonResponse(
        true,
        "All notifications marked as read."
    );

}
catch (PDOException $e) {

    error_log(
        "mark_all_notifications_read.php: " .
        $e->getMessage()
    );


    jsonResponse(
        false,
        "Database error."
    );

}

?>
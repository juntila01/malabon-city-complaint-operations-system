<?php

error_reporting(E_ALL);
ini_set('display_errors', 0);

header("Content-Type: application/json");

date_default_timezone_set('Asia/Manila');

session_start();

require_once "../db.php";


/* ============================================================
   RESPONSE HELPER
============================================================ */

function jsonResponse(
    bool $success,
    string $message = "",
    array $data = []
) {

    echo json_encode(
        array_merge(
            [
                "success" => $success,
                "message" => $message
            ],
            $data
        )
    );

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
   GET CITIZEN ID FROM SESSION
============================================================ */

/*
    We do NOT accept citizenID from JavaScript.

    The logged-in citizen's ID must come from the session.
*/

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


$citizenID = (int) $citizenID;


if ($citizenID <= 0) {

    jsonResponse(
        false,
        "Invalid citizen session."
    );

}


try {

    /* ========================================================
       GET NOTIFICATIONS
    ======================================================== */

    $stmt = $pdo->prepare("
        SELECT
            n.notificationID,
            n.citizenID,
            n.complaintID,
            n.title,
            n.message,
            n.type,
            n.isRead,
            n.createdAt,

            c.rawComplaintText,
            c.status AS complaintStatus,
            c.dispatchStatus

        FROM tbl_notifications n

        LEFT JOIN tbl_complaints c
            ON c.complaintID = n.complaintID

        WHERE n.citizenID = ?

        ORDER BY
            n.createdAt DESC
    ");


    $stmt->execute([
        $citizenID
    ]);


    $notifications =
        $stmt->fetchAll(
            PDO::FETCH_ASSOC
        );


    /* ========================================================
       GET UNREAD COUNT
    ======================================================== */

    $countStmt = $pdo->prepare("
        SELECT COUNT(*)
        FROM tbl_notifications
        WHERE citizenID = ?
          AND isRead = 0
    ");


    $countStmt->execute([
        $citizenID
    ]);


    $unreadCount =
        (int) $countStmt->fetchColumn();


    /* ========================================================
       RETURN RESPONSE
    ======================================================== */

    jsonResponse(
        true,
        "Notifications loaded successfully.",
        [
            "notifications" =>
                $notifications,

            "unreadCount" =>
                $unreadCount
        ]
    );

}
catch (PDOException $e) {

    error_log(
        "get_notifications.php: " .
        $e->getMessage()
    );


    jsonResponse(
        false,
        "Database error while loading notifications."
    );

}

?>
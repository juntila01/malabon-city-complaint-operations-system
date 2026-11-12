<?php

session_start();

header("Content-Type: application/json; charset=utf-8");

date_default_timezone_set("Asia/Manila");

require_once "../db.php";
require_once "../Cores/send_citizen_notification.php";

/* ============================================================
   RESPONSE HELPER
============================================================ */

function jsonResponse(
    bool $success,
    string $message = "",
    array $data = []
): void {

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
    http_response_code(401);

    jsonResponse(
        false,
        "You are not logged in."
    );
}


/* ============================================================
   CHECK SYSTEM USER
============================================================ */

if (
    !isset($_SESSION["user_type"]) ||
    $_SESSION["user_type"] !== "system"
) {
    http_response_code(403);

    jsonResponse(
        false,
        "Only system users can view complaints."
    );
}


/* ============================================================
   GET REQUEST DATA
============================================================ */

$data = json_decode(
    file_get_contents("php://input"),
    true
);

$complaintID = $data["complaintID"] ?? null;

if (
    !is_scalar($complaintID) ||
    !ctype_digit((string) $complaintID) ||
    (int) $complaintID <= 0
) {
    jsonResponse(
        false,
        "A valid complaint ID is required."
    );
}

$complaintID = (int) $complaintID;


/* ============================================================
   PROCESS COMPLAINT VIEW
============================================================ */

try {

    $pdo->beginTransaction();

    /* ========================================================
       GET COMPLAINT AND CITIZEN DETAILS
    ======================================================== */

    $stmt = $pdo->prepare("
        SELECT
            c.complaintID,
            c.citizenID,
            c.complaintReference,
            u.fullName,
            u.email
        FROM tbl_complaints c
        INNER JOIN tbl_citizens u
            ON u.citizenID = c.citizenID
        WHERE c.complaintID = ?
        FOR UPDATE
    ");

    $stmt->execute([
        $complaintID
    ]);

    $complaint = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$complaint) {
        throw new Exception(
            "Complaint or associated citizen account not found."
        );
    }

    $citizenID = (int) $complaint["citizenID"];

    $citizenName = (string) $complaint["fullName"];
    $citizenEmail = trim((string) ($complaint["email"] ?? ""));

    $complaintReference =
        (string) ($complaint["complaintReference"] ?? "");


    /* ========================================================
       CHECK FOR EXISTING VIEWED NOTIFICATION
    ======================================================== */

    $checkStmt = $pdo->prepare("
        SELECT notificationID
        FROM tbl_notifications
        WHERE citizenID = ?
          AND complaintID = ?
          AND type = 'viewed'
        LIMIT 1
    ");

    $checkStmt->execute([
        $citizenID,
        $complaintID
    ]);

    $alreadyViewed = $checkStmt->fetchColumn();

    $notificationCreated = false;

    $notificationTitle = "Complaint Viewed";

    $notificationMessage =
        "Your complaint has been viewed by the administration.";


    /* ========================================================
       CREATE NOTIFICATION ONLY ON FIRST VIEW
    ======================================================== */

    if (!$alreadyViewed) {

        $notificationStmt = $pdo->prepare("
            INSERT INTO tbl_notifications
            (
                citizenID,
                complaintID,
                title,
                message,
                type,
                isRead
            )
            VALUES
            (
                ?,
                ?,
                ?,
                ?,
                'viewed',
                0
            )
        ");

        $notificationStmt->execute([
            $citizenID,
            $complaintID,
            $notificationTitle,
            $notificationMessage
        ]);

        $notificationCreated = true;
    }


    /* ========================================================
       COMMIT DATABASE CHANGES
    ======================================================== */

    $pdo->commit();


    /* ========================================================
       SEND EMAIL ONLY FOR A NEW NOTIFICATION

       Email failures must not undo the database transaction.
    ======================================================== */

    $emailSent = false;

    if (
        $notificationCreated &&
        filter_var($citizenEmail, FILTER_VALIDATE_EMAIL)
    ) {

        $emailSent = sendCitizenNotificationEmail(
            $citizenEmail,
            $citizenName,
            $notificationTitle,
            $notificationMessage,
            $complaintReference !== ""
                ? $complaintReference
                : null
        );

        if (!$emailSent) {
            error_log(
                "Could not send complaint-viewed email. " .
                "Complaint ID: " . $complaintID
            );
        }

    } elseif ($notificationCreated) {

        error_log(
            "Citizen has no valid email for complaint-viewed notification. " .
            "Complaint ID: " . $complaintID
        );
    }


    /* ========================================================
       RETURN RESPONSE
    ======================================================== */

    jsonResponse(
        true,
        "Complaint view recorded.",
        [
            "notificationCreated" => $notificationCreated,
            "emailSent" => $emailSent
        ]
    );


} catch (Throwable $e) {

    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    error_log(
        "mark_complaint_viewed.php: " .
        $e->getMessage()
    );

    jsonResponse(
        false,
        "Unable to record the complaint view. Please try again."
    );
}
?>
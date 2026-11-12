<?php

// verifyEmergencyComplaints.php

session_start();

header("Content-Type: application/json; charset=utf-8");

date_default_timezone_set("Asia/Manila");

require_once "../db.php";
require_once "../Reports/log_operation.php";
require_once "../Cores/send_citizen_notification.php";


// ============================================================
// RESPONSE HELPER
// ============================================================

function jsonResponse(
    bool $success,
    string $message,
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


// ============================================================
// CHECK LOGGED-IN SYSTEM USER
// ============================================================

if (
    !isset($_SESSION['logged_in']) ||
    $_SESSION['logged_in'] !== true
) {

    http_response_code(401);

    jsonResponse(
        false,
        "You are not logged in."
    );

}


// ============================================================
// CHECK SYSTEM USER TYPE
// ============================================================

if (
    !isset($_SESSION['user_type']) ||
    $_SESSION['user_type'] !== 'system'
) {

    http_response_code(403);

    jsonResponse(
        false,
        "Only system users can verify complaints."
    );

}


// ============================================================
// CHECK SYSTEM USER ID
// ============================================================

$systemUsersID = (int) ($_SESSION['user_id'] ?? 0);

if ($systemUsersID <= 0) {

    jsonResponse(
        false,
        "System user ID not found in session."
    );

}


// ============================================================
// PROCESS EMERGENCY COMPLAINTS
// ============================================================

try {

    // ========================================================
    // GET REQUEST DATA
    // ========================================================

    $data = json_decode(
        file_get_contents("php://input"),
        true
    );

    if (!is_array($data)) {

        jsonResponse(
            false,
            "Invalid request data."
        );

    }

    $complaintIDs = $data["complaintIDs"] ?? [];

    if (
        !is_array($complaintIDs) ||
        count($complaintIDs) === 0
    ) {

        jsonResponse(
            false,
            "No emergency complaint IDs were provided."
        );

    }


    // ========================================================
    // VALIDATE AND CLEAN COMPLAINT IDS
    // ========================================================

    $cleanComplaintIDs = [];

    foreach ($complaintIDs as $complaintID) {

        if (
            !is_int($complaintID) &&
            !(
                is_string($complaintID) &&
                ctype_digit($complaintID)
            )
        ) {

            continue;

        }

        $complaintID = (int) $complaintID;

        if ($complaintID > 0) {

            $cleanComplaintIDs[] = $complaintID;

        }

    }

    $complaintIDs = array_values(
        array_unique($cleanComplaintIDs)
    );

    if (count($complaintIDs) === 0) {

        jsonResponse(
            false,
            "Invalid complaint IDs."
        );

    }


    // ========================================================
    // START TRANSACTION
    // ========================================================

    $pdo->beginTransaction();


    // ========================================================
    // BUILD SQL PLACEHOLDERS
    // ========================================================

    $placeholders = implode(
        ',',
        array_fill(
            0,
            count($complaintIDs),
            '?'
        )
    );


    // ========================================================
    // GET COMPLAINT AND CITIZEN DETAILS
    // ========================================================

    $stmt = $pdo->prepare("
        SELECT
            c.complaintID,
            c.citizenID,
            c.complaintReference,
            c.status,
            c.dispatchTeamID,
            u.fullName,
            u.email
        FROM tbl_complaints c

        INNER JOIN tbl_citizens u
            ON u.citizenID = c.citizenID

        WHERE c.complaintID IN ($placeholders)

        FOR UPDATE
    ");

    $stmt->execute($complaintIDs);

    $complaints = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (count($complaints) === 0) {

        throw new Exception(
            "No matching emergency complaints were found."
        );

    }


    // ========================================================
    // PREPARE COMPLAINT UPDATE
    // ========================================================

    $updateStmt = $pdo->prepare("
        UPDATE tbl_complaints
        SET
            status = 'Verified',
            assignedStaffID = ?
        WHERE complaintID = ?
          AND status = 'Pending'
    ");


    // ========================================================
    // PREPARE NOTIFICATION DUPLICATE CHECK
    // ========================================================

    $checkNotificationStmt = $pdo->prepare("
        SELECT notificationID
        FROM tbl_notifications
        WHERE citizenID = ?
          AND complaintID = ?
          AND title = ?
        LIMIT 1
    ");


    // ========================================================
    // PREPARE CITIZEN NOTIFICATION INSERT
    // ========================================================

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
            ?,
            0
        )
    ");


    // ========================================================
    // NOTIFICATION CONTENT
    // ========================================================

    $notificationTitle = "Complaint Verified";

    $notificationMessage =
        "Your complaint has been verified by the administration " .
        "and is now being processed.";


    // ========================================================
    // COUNTERS AND EMAIL QUEUE
    // ========================================================

    $verifiedCount = 0;
    $alreadyVerifiedCount = 0;
    $skippedCount = 0;

    /*
     * Store email details for newly created notifications.
     * Emails are sent only after the database transaction commits.
     */

    $emailsToSend = [];


    // ========================================================
    // PROCESS EACH COMPLAINT
    // ========================================================

    foreach ($complaints as $complaint) {

        $id = (int) $complaint["complaintID"];

        $citizenID = (int) $complaint["citizenID"];

        $oldStatus = (string) $complaint["status"];


        // ====================================================
        // ALREADY VERIFIED
        // ====================================================

        if ($oldStatus === "Verified") {

            $alreadyVerifiedCount++;

            continue;

        }


        // ====================================================
        // ONLY PENDING COMPLAINTS ARE BULK VERIFIED
        // ====================================================

        if ($oldStatus !== "Pending") {

            $skippedCount++;

            continue;

        }


        // ====================================================
        // UPDATE COMPLAINT STATUS
        // ====================================================

        $updateStmt->execute([
            $systemUsersID,
            $id
        ]);

        if ($updateStmt->rowCount() !== 1) {

            $skippedCount++;

            continue;

        }


        // ====================================================
        // CHECK EXISTING NOTIFICATION
        // ====================================================

        $checkNotificationStmt->execute([
            $citizenID,
            $id,
            $notificationTitle
        ]);

        $existingNotification =
            $checkNotificationStmt->fetchColumn();

        $notificationCreated = false;


        // ====================================================
        // CREATE NOTIFICATION ONLY IF IT DOES NOT EXIST
        // ====================================================

        if (!$existingNotification) {

            $notificationStmt->execute([
                $citizenID,
                $id,
                $notificationTitle,
                $notificationMessage,
                "complaint"
            ]);

            $notificationCreated = true;

        }


        // ====================================================
        // QUEUE EMAIL FOR NEW NOTIFICATION
        // ====================================================

        if ($notificationCreated) {

            $emailsToSend[] = [
                "email" => trim(
                    (string) ($complaint["email"] ?? '')
                ),
                "name" => (string) ($complaint["fullName"] ?? ''),
                "complaintReference" => trim(
                    (string) (
                        $complaint["complaintReference"] ?? ''
                    )
                ),
                "complaintID" => $id,
                "title" => $notificationTitle,
                "message" => $notificationMessage
            ];

        }


        // ====================================================
        // OPERATIONAL LOG
        // ====================================================

        logOperation(
            $pdo,
            'system_user',
            $systemUsersID,
            $_SESSION['user_email'] ?? 'System User',
            'Verify Emergency Complaint',
            "System user verified complaint #{$id} as part of an emergency incident.",
            $id,
            $oldStatus,
            'Verified'
        );


        $verifiedCount++;

    }


    // ========================================================
    // COMMIT DATABASE CHANGES
    // ========================================================

    $pdo->commit();


    // ========================================================
    // SEND CITIZEN EMAILS AFTER COMMIT
    // ========================================================

    $emailsSent = 0;
    $emailsFailed = 0;
    $emailsSkipped = 0;

    foreach ($emailsToSend as $emailData) {

        $citizenEmail = $emailData["email"];

        if (
            !filter_var(
                $citizenEmail,
                FILTER_VALIDATE_EMAIL
            )
        ) {

            $emailsSkipped++;

            error_log(
                "Invalid citizen email for emergency verification. " .
                "Complaint ID: " .
                $emailData["complaintID"]
            );

            continue;

        }

        try {

            $emailSent = sendCitizenNotificationEmail(
                $citizenEmail,
                $emailData["name"],
                $emailData["title"],
                $emailData["message"],
                $emailData["complaintReference"] !== ''
                    ? $emailData["complaintReference"]
                    : null
            );

            if ($emailSent) {

                $emailsSent++;

            } else {

                $emailsFailed++;

                error_log(
                    "Could not send emergency verification email. " .
                    "Complaint ID: " .
                    $emailData["complaintID"]
                );

            }

        } catch (Throwable $emailException) {

            $emailsFailed++;

            error_log(
                "Emergency verification email exception. " .
                "Complaint ID: " .
                $emailData["complaintID"] .
                " | Error: " .
                $emailException->getMessage()
            );

        }

    }


    // ========================================================
    // SUCCESS RESPONSE
    // ========================================================

    jsonResponse(
        true,
        "Emergency complaints processed successfully.",
        [
            "verifiedCount" => $verifiedCount,
            "alreadyVerifiedCount" => $alreadyVerifiedCount,
            "skippedCount" => $skippedCount,
            "totalProcessed" => count($complaints),
            "notificationCount" => count($emailsToSend),
            "emailsSent" => $emailsSent,
            "emailsFailed" => $emailsFailed,
            "emailsSkipped" => $emailsSkipped
        ]
    );


} catch (Throwable $e) {

    if ($pdo->inTransaction()) {

        $pdo->rollBack();

    }

    error_log(
        "VERIFY EMERGENCY COMPLAINTS ERROR: " .
        $e->getMessage()
    );

    jsonResponse(
        false,
        "Unable to process emergency complaints. Please try again."
    );

}

?>
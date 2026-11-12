<?php

// unableToResolve.php

error_reporting(E_ALL);
ini_set('display_errors', 0);

session_start();

header("Content-Type: application/json; charset=utf-8");

date_default_timezone_set("Asia/Manila");

require_once "../db.php";
require_once "../Reports/log_operation.php";
require_once "../Cores/send_citizen_notification.php";


/* ============================================================
   RESPONSE HELPER
============================================================ */

function respond(
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
   AUTHENTICATION
============================================================ */

if (
    !isset($_SESSION['logged_in']) ||
    $_SESSION['logged_in'] !== true
) {

    http_response_code(401);

    respond(
        false,
        "Unauthorized. Please log in again."
    );

}

if (
    ($_SESSION['user_type'] ?? '') !== 'dispatch_team'
) {

    http_response_code(403);

    respond(
        false,
        "Unauthorized. Dispatch Team access required."
    );

}

$teamID = (int) ($_SESSION['team_id'] ?? 0);

if ($teamID <= 0) {

    respond(
        false,
        "Dispatch Team ID not found in session."
    );

}


/* ============================================================
   READ JSON REQUEST
============================================================ */

$input = json_decode(
    file_get_contents("php://input"),
    true
);

if (!is_array($input)) {

    respond(
        false,
        "Invalid request data."
    );

}

$complaintID = filter_var(
    $input['complaintID'] ?? null,
    FILTER_VALIDATE_INT,
    [
        "options" => [
            "min_range" => 1
        ]
    ]
);

$reason = trim(
    is_string($input['reason'] ?? null)
        ? $input['reason']
        : ''
);

$details = trim(
    is_string($input['details'] ?? null)
        ? $input['details']
        : ''
);

if ($complaintID === false || $complaintID === null) {

    respond(
        false,
        "Invalid complaint ID."
    );

}

if ($reason === '') {

    respond(
        false,
        "Reason is required."
    );

}

$complaintID = (int) $complaintID;


/* ============================================================
   PROCESS
============================================================ */

try {

    /* ========================================================
       GET COMPLAINT AND CITIZEN DETAILS
    ======================================================== */

    $stmt = $pdo->prepare("
        SELECT
            c.complaintID,
            c.citizenID,
            c.complaintReference,
            c.dispatchTeamID,
            c.dispatchStatus,
            u.fullName,
            u.email
        FROM tbl_complaints c
        INNER JOIN tbl_citizens u
            ON u.citizenID = c.citizenID
        WHERE c.complaintID = :complaintID
          AND c.dispatchTeamID = :teamID
        LIMIT 1
    ");

    $stmt->execute([
        ":complaintID" => $complaintID,
        ":teamID" => $teamID
    ]);

    $complaint = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$complaint) {

        respond(
            false,
            "This complaint is not assigned to your dispatch team."
        );

    }

    $citizenID = (int) $complaint['citizenID'];

    $citizenName = (string) ($complaint['fullName'] ?? '');

    $citizenEmail = trim(
        (string) ($complaint['email'] ?? '')
    );

    $complaintReference = trim(
        (string) ($complaint['complaintReference'] ?? '')
    );


    /* ========================================================
       CHECK CURRENT STATUS
    ======================================================== */

    $currentStatus = strtolower(
        trim(
            (string) ($complaint['dispatchStatus'] ?? '')
        )
    );

    if (
        !in_array(
            $currentStatus,
            [
                "assigned",
                "on the way",
                "arrived"
            ],
            true
        )
    ) {

        respond(
            false,
            "This complaint cannot be marked as unable to resolve in its current status."
        );

    }


    /* ========================================================
       START TRANSACTION
    ======================================================== */

    $pdo->beginTransaction();


    /* ========================================================
       BUILD LOG DETAILS
    ======================================================== */

    $logDetails = $reason;

    if ($details !== '') {

        $logDetails .= " - " . $details;

    }


    /* ========================================================
       UPDATE COMPLAINT
    ======================================================== */

    $stmt = $pdo->prepare("
        UPDATE tbl_complaints
        SET
            dispatchTeamID = NULL,
            dispatchStatus = 'Unable to Resolve',
            status = 'Unable to Resolve',
            completedAt = NOW()
        WHERE complaintID = :complaintID
          AND dispatchTeamID = :teamID
          AND dispatchStatus IN (
              'Assigned',
              'On the Way',
              'Arrived'
          )
    ");

    $stmt->execute([
        ":complaintID" => $complaintID,
        ":teamID" => $teamID
    ]);

    if ($stmt->rowCount() !== 1) {

        throw new Exception(
            "The complaint could not be marked as unable to resolve."
        );

    }


    /* ========================================================
       CREATE DISPATCH LOG
    ======================================================== */

    $stmt = $pdo->prepare("
        INSERT INTO tbl_dispatch_logs
        (
            complaintID,
            systemUserID,
            dispatchTeamID,
            action,
            details,
            createdAt
        )
        VALUES
        (
            :complaintID,
            NULL,
            :dispatchTeamID,
            'Unable to Resolve',
            :details,
            NOW()
        )
    ");

    $stmt->execute([
        ":complaintID" => $complaintID,
        ":dispatchTeamID" => $teamID,
        ":details" => $logDetails
    ]);


    /* ========================================================
       MOVE TO NEXT QUEUED COMPLAINT
    ======================================================== */

    /*
     * Only Assigned complaints are considered queued.
     * The complaint just updated no longer belongs to this team.
     */

    $stmt = $pdo->prepare("
        SELECT complaintID
        FROM tbl_complaints
        WHERE dispatchTeamID = :teamID
          AND dispatchStatus = 'Assigned'
        ORDER BY createdAt ASC
        LIMIT 1
    ");

    $stmt->execute([
        ":teamID" => $teamID
    ]);

    $nextComplaint = $stmt->fetch(PDO::FETCH_ASSOC);


    /* ========================================================
       PROMOTE NEXT COMPLAINT OR FREE THE TEAM
    ======================================================== */

    if ($nextComplaint) {

        $stmt = $pdo->prepare("
            UPDATE tbl_dispatch_teams
            SET
                status = 'Dispatched',
                currentComplaintID = :nextComplaintID
            WHERE teamID = :teamID
        ");

        $stmt->execute([
            ":nextComplaintID" => $nextComplaint['complaintID'],
            ":teamID" => $teamID
        ]);

    } else {

        $stmt = $pdo->prepare("
            UPDATE tbl_dispatch_teams
            SET
                status = 'Available',
                currentComplaintID = NULL
            WHERE teamID = :teamID
        ");

        $stmt->execute([
            ":teamID" => $teamID
        ]);

    }


    /* ========================================================
       CITIZEN NOTIFICATION DETAILS
    ======================================================== */

    $notificationTitle = "Complaint Unable to Resolve";

    $notificationMessage =
        "Your complaint " .
        (
            $complaintReference !== ''
                ? "#" . $complaintReference
                : "#" . $complaintID
        ) .
        " could not be resolved by the Malabon City Action Team. " .
        "Reason: " . $logDetails;


    /* ========================================================
       CHECK FOR EXISTING NOTIFICATION
    ======================================================== */

    $checkNotificationStmt = $pdo->prepare("
        SELECT notificationID
        FROM tbl_notifications
        WHERE citizenID = :citizenID
          AND complaintID = :complaintID
          AND title = :title
        LIMIT 1
    ");

    $checkNotificationStmt->execute([
        ":citizenID" => $citizenID,
        ":complaintID" => $complaintID,
        ":title" => $notificationTitle
    ]);

    $existingNotification =
        $checkNotificationStmt->fetchColumn();

    $notificationCreated = false;


    /* ========================================================
       CREATE CITIZEN NOTIFICATION ONLY ONCE
    ======================================================== */

    if (!$existingNotification) {

        $notificationStmt = $pdo->prepare("
            INSERT INTO tbl_notifications
            (
                citizenID,
                complaintID,
                title,
                message,
                type,
                isRead,
                createdAt
            )
            VALUES
            (
                :citizenID,
                :complaintID,
                :title,
                :message,
                :type,
                0,
                NOW()
            )
        ");

        $notificationStmt->execute([
            ":citizenID" => $citizenID,
            ":complaintID" => $complaintID,
            ":title" => $notificationTitle,
            ":message" => $notificationMessage,
            ":type" => "complaint"
        ]);

        $notificationCreated = true;

    }


    /* ========================================================
       OPERATIONAL LOG
    ======================================================== */

    logOperation(
        $pdo,
        'dispatch_team',
        $teamID,
        $_SESSION['team_name'] ?? 'Dispatch Team',
        'Unable to Resolve Complaint',
        "Dispatch team marked complaint #{$complaintID} as unable to resolve. Reason: {$logDetails}",
        $complaintID,
        $currentStatus,
        'Unable to Resolve'
    );


    /* ========================================================
       COMMIT DATABASE CHANGES
    ======================================================== */

    $pdo->commit();


    /* ========================================================
       SEND CITIZEN EMAIL AFTER COMMIT

       Only send an email when a new in-app notification
       has been created.

       Email failure must not undo the successful
       complaint update or dispatch-team changes.
    ======================================================== */

    $emailSent = false;

    if (
        $notificationCreated &&
        filter_var(
            $citizenEmail,
            FILTER_VALIDATE_EMAIL
        )
    ) {

        try {

            $emailSent = sendCitizenNotificationEmail(
                $citizenEmail,
                $citizenName,
                $notificationTitle,
                $notificationMessage,
                $complaintReference !== ''
                    ? $complaintReference
                    : null
            );

            if (!$emailSent) {

                error_log(
                    "Could not send unable-to-resolve email. " .
                    "Complaint ID: " . $complaintID
                );

            }

        } catch (Throwable $emailException) {

            $emailSent = false;

            error_log(
                "Unable-to-resolve email exception. " .
                "Complaint ID: " . $complaintID .
                " | Error: " . $emailException->getMessage()
            );

        }

    } elseif ($notificationCreated) {

        error_log(
            "Citizen has no valid email for unable-to-resolve notification. " .
            "Complaint ID: " . $complaintID
        );

    }


    /* ========================================================
       RETURN RESPONSE
    ======================================================== */

    respond(
        true,
        "Complaint marked as unable to resolve.",
        [
            "complaintID" => $complaintID,
            "dispatchStatus" => "Unable to Resolve",
            "notificationCreated" => $notificationCreated,
            "emailSent" => $emailSent
        ]
    );


} catch (Throwable $e) {

    if ($pdo->inTransaction()) {

        $pdo->rollBack();

    }

    error_log(
        "UNABLE TO RESOLVE ERROR: " .
        $e->getMessage()
    );

    respond(
        false,
        "Unable to mark the complaint as unable to resolve. Please try again."
    );

}

?>
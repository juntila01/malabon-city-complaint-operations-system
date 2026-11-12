
<?php
// resolveComplaint.php

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

function respond($data)
{
    echo json_encode($data);
    exit;
}

/* ============================================================
   AUTHENTICATION
============================================================ */

if (
    empty($_SESSION['logged_in']) ||
    $_SESSION['logged_in'] !== true
) {
    http_response_code(401);

    respond([
        "success" => false,
        "message" => "Unauthorized. Please log in again."
    ]);
}

if (
    ($_SESSION['user_type'] ?? '') !== 'dispatch_team'
) {
    http_response_code(403);

    respond([
        "success" => false,
        "message" => "Unauthorized. Dispatch Team access required."
    ]);
}

$teamID = (int) ($_SESSION['team_id'] ?? 0);

if ($teamID <= 0) {
    respond([
        "success" => false,
        "message" => "Dispatch Team ID not found in session."
    ]);
}

/* ============================================================
   INPUT
============================================================ */

$complaintID = isset($_POST['complaintID'])
    ? (int) $_POST['complaintID']
    : 0;

$resolutionNote = trim(
    $_POST['resolutionNote'] ?? ''
);

if ($complaintID <= 0) {
    respond([
        "success" => false,
        "message" => "Invalid complaint ID."
    ]);
}

if ($resolutionNote === '') {
    respond([
        "success" => false,
        "message" => "Resolution note is required."
    ]);
}

/* ============================================================
   GET COMPLAINT
============================================================ */

try {

    $stmt = $pdo->prepare("
        SELECT
            complaintID,
            citizenID,
            complaintReference,
            dispatchStatus,
            assignedStaffID,
            dispatchTeamID
        FROM tbl_complaints
        WHERE complaintID = :complaintID
        LIMIT 1
    ");

    $stmt->execute([
        ":complaintID" => $complaintID
    ]);

    $complaint = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$complaint) {
        respond([
            "success" => false,
            "message" => "Complaint not found."
        ]);
    }

    /* ========================================================
       CHECK TEAM ASSIGNMENT
    ======================================================== */

    if (
        (int) ($complaint['dispatchTeamID'] ?? 0)
        !== $teamID
    ) {
        respond([
            "success" => false,
            "message" =>
                "This complaint is not assigned to your dispatch team."
        ]);
    }

    /* ========================================================
       CHECK CURRENT STATUS
    ======================================================== */

    $currentStatus = strtolower(
        trim($complaint['dispatchStatus'] ?? '')
    );

    if ($currentStatus !== "arrived") {
        respond([
            "success" => false,
            "message" =>
                "This complaint cannot be resolved yet. " .
                "The dispatch status must be Arrived."
        ]);
    }

    /* ========================================================
       START TRANSACTION
    ======================================================== */

    $pdo->beginTransaction();

    /*
     * Store all complaint IDs that will be resolved.
     * A normal complaint contains one ID.
     * An emergency cluster may contain several.
     */

    $resolvedComplaintIDs = [$complaintID];

    /* ========================================================
       CHECK EMERGENCY INCIDENT
    ======================================================== */

    $stmt = $pdo->prepare("
        SELECT
            ec.clusterID,
            ec.clusterReference,
            ec.status
        FROM tbl_emergency_clusters ec
        INNER JOIN tbl_emergency_cluster_complaints ecc
            ON ecc.clusterID = ec.clusterID
        WHERE ecc.complaintID = :complaintID
          AND ec.status NOT IN (
              'Resolved',
              'Unable to Resolve'
          )
        LIMIT 1
        FOR UPDATE
    ");

    $stmt->execute([
        ":complaintID" => $complaintID
    ]);

    $emergencyCluster = $stmt->fetch(PDO::FETCH_ASSOC);

    /* ========================================================
       RESOLVE COMPLAINT / EMERGENCY INCIDENT
    ======================================================== */

    if ($emergencyCluster) {

        $clusterID = (int) $emergencyCluster['clusterID'];

        /*
         * Get every complaint linked to this incident.
         */

        $stmt = $pdo->prepare("
            SELECT complaintID
            FROM tbl_emergency_cluster_complaints
            WHERE clusterID = :clusterID
        ");

        $stmt->execute([
            ":clusterID" => $clusterID
        ]);

        $clusterComplaints = array_map(
            'intval',
            $stmt->fetchAll(PDO::FETCH_COLUMN)
        );

        if (empty($clusterComplaints)) {
            throw new Exception(
                "Emergency incident contains no linked complaints."
            );
        }

        $resolvedComplaintIDs = $clusterComplaints;

        /*
         * Confirm that every linked complaint is Arrived
         * and assigned to this dispatch team.
         */

        $placeholders = implode(
            ",",
            array_fill(0, count($clusterComplaints), "?")
        );

        $stmt = $pdo->prepare("
            SELECT
                complaintID,
                dispatchStatus,
                dispatchTeamID
            FROM tbl_complaints
            WHERE complaintID IN ($placeholders)
            FOR UPDATE
        ");

        $stmt->execute($clusterComplaints);

        $clusterStatusRows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if (
            count($clusterStatusRows) !==
            count($clusterComplaints)
        ) {
            throw new Exception(
                "Some complaints linked to the emergency incident could not be found."
            );
        }

        foreach ($clusterStatusRows as $row) {

            $status = strtolower(
                trim($row['dispatchStatus'] ?? '')
            );

            if ($status !== 'arrived') {
                throw new Exception(
                    "Emergency incident cannot be resolved yet. " .
                    "Complaint #" . $row['complaintID'] .
                    " is still " .
                    ($row['dispatchStatus'] ?: 'not assigned') .
                    "."
                );
            }

            if (
                (int) ($row['dispatchTeamID'] ?? 0)
                !== $teamID
            ) {
                throw new Exception(
                    "All complaints in the emergency incident " .
                    "must be assigned to your dispatch team."
                );
            }
        }

        /*
         * Resolve every complaint in the cluster.
         */

        $stmt = $pdo->prepare("
            UPDATE tbl_complaints
            SET
                dispatchTeamID = NULL,
                dispatchStatus = 'Resolved',
                status = 'Resolved',
                completedAt = NOW()
            WHERE complaintID IN ($placeholders)
              AND dispatchStatus = 'Arrived'
        ");

        $stmt->execute($clusterComplaints);

        /*
         * Make sure all linked complaints were updated.
         */

        if (
            $stmt->rowCount() !== count($clusterComplaints)
        ) {
            throw new Exception(
                "Not all complaints in the emergency incident could be resolved."
            );
        }

        /*
         * Resolve the emergency incident.
         */

        $stmt = $pdo->prepare("
            UPDATE tbl_emergency_clusters
            SET
                status = 'Resolved',
                resolvedAt = NOW()
            WHERE clusterID = :clusterID
        ");

        $stmt->execute([
            ":clusterID" => $clusterID
        ]);

    } else {

        /*
         * Normal single-complaint resolution.
         */

        $stmt = $pdo->prepare("
            UPDATE tbl_complaints
            SET
                dispatchTeamID = NULL,
                dispatchStatus = 'Resolved',
                status = 'Resolved',
                completedAt = NOW()
            WHERE complaintID = :complaintID
              AND dispatchTeamID = :teamID
              AND dispatchStatus = 'Arrived'
        ");

        $stmt->execute([
            ":complaintID" => $complaintID,
            ":teamID" => $teamID
        ]);

        if ($stmt->rowCount() !== 1) {
            throw new Exception(
                "The complaint status changed or the complaint is no longer assigned to your team."
            );
        }
    }

    /* ========================================================
       RESOLUTION EVIDENCE
    ======================================================== */

    if (
        isset($_FILES['resolutionEvidence']) &&
        $_FILES['resolutionEvidence']['error'] !== UPLOAD_ERR_NO_FILE
    ) {

        if (
            $_FILES['resolutionEvidence']['error']
            !== UPLOAD_ERR_OK
        ) {
            throw new Exception(
                "Resolution evidence upload failed."
            );
        }

        $file = $_FILES['resolutionEvidence'];

        if ($file['size'] > 5 * 1024 * 1024) {
            throw new Exception(
                "Resolution evidence cannot exceed 5MB."
            );
        }

        $finfo = finfo_open(FILEINFO_MIME_TYPE);

        if ($finfo === false) {
            throw new Exception(
                "Unable to validate resolution evidence."
            );
        }

        $mime = finfo_file(
            $finfo,
            $file['tmp_name']
        );

        finfo_close($finfo);

        $allowed = [
            "image/jpeg" => "jpg",
            "image/png" => "png"
        ];

        if (!isset($allowed[$mime])) {
            throw new Exception(
                "Resolution evidence must be a JPG or PNG image."
            );
        }

        $uploadDir = "../uploads/resolutions/";

        if (!is_dir($uploadDir)) {
            if (!mkdir($uploadDir, 0755, true)) {
                throw new Exception(
                    "Unable to create resolution upload directory."
                );
            }
        }

        $newName = bin2hex(random_bytes(16))
            . "."
            . $allowed[$mime];

        $physicalPath = $uploadDir . $newName;

        $webPath = "uploads/resolutions/" . $newName;

        if (
            !move_uploaded_file(
                $file['tmp_name'],
                $physicalPath
            )
        ) {
            throw new Exception(
                "Unable to save resolution evidence."
            );
        }

        $stmt = $pdo->prepare("
            INSERT INTO tbl_attachments
            (
                complaintID,
                fileName,
                filePath,
                uploadedAt
            )
            VALUES
            (
                :complaintID,
                :fileName,
                :filePath,
                NOW()
            )
        ");

        $stmt->execute([
            ":complaintID" => $complaintID,
            ":fileName" => $newName,
            ":filePath" => $webPath
        ]);
    }

    /* ========================================================
       MOVE TO NEXT QUEUED COMPLAINT
    ======================================================== */

    $stmt = $pdo->prepare("
        SELECT complaintID
        FROM tbl_complaints
        WHERE dispatchTeamID = :teamID
          AND dispatchStatus IN (
              'Assigned',
              'On the Way',
              'Arrived'
          )
        ORDER BY
            CASE
                WHEN dispatchStatus = 'Assigned'
                THEN 0
                ELSE 1
            END,
            createdAt ASC
        LIMIT 1
    ");

    $stmt->execute([
        ":teamID" => $teamID
    ]);

    $nextComplaint = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($nextComplaint) {

        $stmt = $pdo->prepare("
            UPDATE tbl_dispatch_teams
            SET
                status = 'Dispatched',
                currentComplaintID = :nextComplaintID
            WHERE teamID = :teamID
        ");

        $stmt->execute([
            ":nextComplaintID" =>
                $nextComplaint['complaintID'],
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
       CREATE CITIZEN NOTIFICATIONS
    ======================================================== */

    $emailNotifications = [];

    $citizenStmt = $pdo->prepare("
        SELECT
            c.complaintID,
            c.citizenID,
            c.complaintReference,
            u.fullName,
            u.email
        FROM tbl_complaints c
        INNER JOIN tbl_citizens u
            ON u.citizenID = c.citizenID
        WHERE c.complaintID = :complaintID
        LIMIT 1
    ");

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
            'complaint',
            0,
            NOW()
        )
    ");

    foreach ($resolvedComplaintIDs as $resolvedID) {

        $citizenStmt->execute([
            ":complaintID" => $resolvedID
        ]);

        $citizen = $citizenStmt->fetch(PDO::FETCH_ASSOC);

        if (!$citizen) {
            throw new Exception(
                "Citizen details not found for complaint #" .
                $resolvedID
            );
        }

        $title = "Complaint Resolved";

        $reference = trim(
            (string) ($citizen['complaintReference'] ?? '')
        );

        $displayReference = $reference !== ''
            ? $reference
            : (string) $resolvedID;

        $message =
            "Your complaint #{$displayReference} has been resolved " .
            "by the Malabon City Action Team.";

        $notificationStmt->execute([
            ":citizenID" => (int) $citizen['citizenID'],
            ":complaintID" => (int) $resolvedID,
            ":title" => $title,
            ":message" => $message
        ]);

        $emailNotifications[] = [
            "email" => trim(
                (string) ($citizen['email'] ?? '')
            ),
            "name" => (string) $citizen['fullName'],
            "title" => $title,
            "message" => $message,
            "reference" => $reference !== ''
                ? $reference
                : null,
            "complaintID" => (int) $resolvedID
        ];
    }

    /* ========================================================
       COMMIT DATABASE CHANGES
    ======================================================== */

    $pdo->commit();

    /* ========================================================
       SEND CITIZEN EMAIL NOTIFICATIONS
       Email failures must not undo the resolution.
    ======================================================== */

    $emailResults = [];

    foreach ($emailNotifications as $emailData) {

        $emailSent = false;

        if (
            filter_var(
                $emailData['email'],
                FILTER_VALIDATE_EMAIL
            )
        ) {

            try {

                $emailSent = sendCitizenNotificationEmail(
                    $emailData['email'],
                    $emailData['name'],
                    $emailData['title'],
                    $emailData['message'],
                    $emailData['reference']
                );

            } catch (Throwable $emailError) {

                error_log(
                    "Resolution email exception for complaint #" .
                    $emailData['complaintID'] . ": " .
                    $emailError->getMessage()
                );
            }

        } else {

            error_log(
                "Invalid citizen email for complaint #" .
                $emailData['complaintID']
            );
        }

        if (!$emailSent) {
            error_log(
                "Could not send resolution email for complaint #" .
                $emailData['complaintID']
            );
        }

        $emailResults[] = [
            "complaintID" => $emailData['complaintID'],
            "emailSent" => $emailSent
        ];
    }

    /* ========================================================
       LOG COMPLAINT RESOLUTION
    ======================================================== */

    try {

        logOperation(
            $pdo,
            "dispatch_team",
            $teamID,
            $_SESSION['team_name'] ?? "Dispatch Team",
            "Complaint Resolved",
            "Dispatch team resolved complaint #{$complaintID}. " .
            "Resolution note: {$resolutionNote}",
            $complaintID,
            "Dispatch Status: Arrived | Complaint Status: In Progress",
            "Dispatch Status: Resolved | Complaint Status: Resolved"
        );

    } catch (Throwable $logError) {

        error_log(
            "Could not log complaint resolution #" .
            $complaintID . ": " .
            $logError->getMessage()
        );
    }

    /* ========================================================
       SUCCESS RESPONSE
    ======================================================== */

    respond([
        "success" => true,
        "message" => "Complaint successfully resolved.",
        "complaintID" => $complaintID,
        "emailResults" => $emailResults
    ]);

} catch (Throwable $e) {

    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    error_log(
        "resolveComplaint.php: " .
        $e->getMessage()
    );

    respond([
        "success" => false,
        "message" =>
            "Unable to resolve the complaint. Please try again."
    ]);
}

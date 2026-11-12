<?php

// dispatchEmergencyComplaints.php

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
        "Only system users can dispatch complaints."
    );

}


// ============================================================
// PROCESS EMERGENCY DISPATCH
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

    $teamID = filter_var(
        $data["teamID"] ?? null,
        FILTER_VALIDATE_INT,
        [
            "options" => [
                "min_range" => 1
            ]
        ]
    );

    if (
        !is_array($complaintIDs) ||
        count($complaintIDs) === 0
    ) {

        jsonResponse(
            false,
            "No emergency complaint IDs were provided."
        );

    }

    if ($teamID === false || $teamID === null) {

        jsonResponse(
            false,
            "No dispatch team was selected."
        );

    }

    $teamID = (int) $teamID;


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
    // LOCK DISPATCH TEAM
    // ========================================================

    $teamStmt = $pdo->prepare("
        SELECT
            teamID,
            teamName,
            status,
            currentComplaintID
        FROM tbl_dispatch_teams
        WHERE teamID = ?
        FOR UPDATE
    ");

    $teamStmt->execute([
        $teamID
    ]);

    $team = $teamStmt->fetch(PDO::FETCH_ASSOC);

    if (!$team) {

        throw new Exception(
            "Dispatch team not found."
        );

    }

    if (
        $team["status"] !== "Available" &&
        $team["status"] !== "Dispatched"
    ) {

        throw new Exception(
            "This dispatch team is not available for emergency dispatch."
        );

    }


    // ========================================================
    // GET COMPLAINTS AND CITIZEN DETAILS
    // ========================================================

    $placeholders = implode(
        ",",
        array_fill(
            0,
            count($complaintIDs),
            "?"
        )
    );

    $complaintStmt = $pdo->prepare("
        SELECT
            c.complaintID,
            c.citizenID,
            c.complaintReference,
            c.status,
            c.aiAnalysisStatus,
            c.dispatchTeamID,
            c.dispatchStatus,
            u.fullName,
            u.email
        FROM tbl_complaints c

        INNER JOIN tbl_citizens u
            ON u.citizenID = c.citizenID

        WHERE c.complaintID IN ($placeholders)

        ORDER BY c.complaintID ASC

        FOR UPDATE
    ");

    $complaintStmt->execute($complaintIDs);

    $complaints = $complaintStmt->fetchAll(
        PDO::FETCH_ASSOC
    );

    if (
        count($complaints) !== count($complaintIDs)
    ) {

        throw new Exception(
            "One or more emergency complaints could not be found."
        );

    }


    // ========================================================
    // VALIDATE ALL COMPLAINTS
    // ========================================================

        foreach ($complaints as $complaint) {

        $complaintID = (int) $complaint["complaintID"];

        // Require completed AI analysis or manual review.
        $aiAnalysisStatus = strtolower(
            trim(
                (string) ($complaint["aiAnalysisStatus"] ?? "")
            )
        );

        if ($aiAnalysisStatus !== "completed") {

            throw new Exception(
                "Emergency dispatch blocked: complaint #" .
                $complaintID .
                " has not completed AI analysis or manual review."
            );

        }

        // Complaint must already be verified.
        if ($complaint["status"] !== "Verified") {

            throw new Exception(
                "Complaint #" .
                $complaintID .
                " is not verified and cannot be dispatched."
            );

        }

        // Complaint must not already have a dispatch team.
        if (!empty($complaint["dispatchTeamID"])) {

            throw new Exception(
                "Complaint #" .
                $complaintID .
                " is already assigned to a dispatch team."
            );

        }

    }


    // ========================================================
    // CHECK FOR EXISTING ACTIVE EMERGENCY CLUSTER
    // ========================================================

    $existingClusterStmt = $pdo->prepare("
        SELECT DISTINCT
            ec.clusterID,
            ec.clusterReference,
            ec.status
        FROM tbl_emergency_clusters ec

        INNER JOIN tbl_emergency_cluster_complaints ecc
            ON ecc.clusterID = ec.clusterID

        WHERE ecc.complaintID IN ($placeholders)

          AND ec.status NOT IN (
              'Resolved',
              'Unable to Resolve'
          )

        LIMIT 1
    ");

    $existingClusterStmt->execute($complaintIDs);

    $existingCluster = $existingClusterStmt->fetch(
        PDO::FETCH_ASSOC
    );

    if ($existingCluster) {

        throw new Exception(
            "These complaints are already part of active emergency incident " .
            $existingCluster["clusterReference"] . "."
        );

    }


    // ========================================================
    // REPRESENTATIVE COMPLAINT
    // ========================================================

    /*
     * The first complaint is the representative complaint
     * used as the dispatch team's main reference.
     */

    $representativeComplaintID =
        (int) $complaints[0]["complaintID"];


    // ========================================================
    // GET CLUSTER INFORMATION
    // ========================================================

    $clusterInfoStmt = $pdo->prepare("
        SELECT
            ai.category,
            ai.urgency,
            loc.latitude,
            loc.longitude
        FROM tbl_complaints c

        LEFT JOIN tbl_ai_analysis ai
            ON ai.complaintID = c.complaintID

        LEFT JOIN tbl_complaint_locations loc
            ON loc.complaintID = c.complaintID

        WHERE c.complaintID = ?

        ORDER BY
            loc.recordedAt DESC,
            ai.analyzedAt DESC

        LIMIT 1
    ");

    $clusterInfoStmt->execute([
        $representativeComplaintID
    ]);

    $clusterInfo = $clusterInfoStmt->fetch(
        PDO::FETCH_ASSOC
    );

    if (!$clusterInfo) {

        throw new Exception(
            "Unable to determine emergency cluster information."
        );

    }

    $category = $clusterInfo["category"] ?? "Uncategorized";

    $latitude = $clusterInfo["latitude"];

    $longitude = $clusterInfo["longitude"];

    if (
        $latitude === null ||
        $longitude === null
    ) {

        throw new Exception(
            "The emergency cluster does not have a valid location."
        );

    }


    // ========================================================
    // DETERMINE EMERGENCY SEVERITY
    // ========================================================

    $highCount = 0;

    $urgencyStmt = $pdo->prepare("
        SELECT urgency
        FROM tbl_ai_analysis
        WHERE complaintID = ?
        ORDER BY analyzedAt DESC
        LIMIT 1
    ");

    foreach ($complaints as $complaint) {

        $urgencyStmt->execute([
            $complaint["complaintID"]
        ]);

        $urgency = $urgencyStmt->fetchColumn();

        if (
            strtoupper((string) $urgency) === "HIGH"
        ) {

            $highCount++;

        }

    }

    $totalComplaints = count($complaints);

    if (
        $totalComplaints >= 10 &&
        $highCount >= 5
    ) {

        $severity = "CRITICAL";

    } else {

        $severity = "EMERGENCY";

    }


    // ========================================================
    // CREATE UNIQUE CLUSTER REFERENCE
    // ========================================================

    $clusterReference =
        "EC-" .
        date("Ymd-His") .
        "-" .
        $representativeComplaintID;


    // ========================================================
    // CREATE EMERGENCY CLUSTER
    // ========================================================

    $clusterStmt = $pdo->prepare("
        INSERT INTO tbl_emergency_clusters
        (
            clusterReference,
            category,
            severity,
            latitude,
            longitude,
            representativeComplaintID,
            dispatchTeamID,
            status,
            dispatchedAt
        )
        VALUES
        (
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            'Dispatched',
            NOW()
        )
    ");

    $clusterStmt->execute([
        $clusterReference,
        $category,
        $severity,
        $latitude,
        $longitude,
        $representativeComplaintID,
        $teamID
    ]);

    $clusterID = (int) $pdo->lastInsertId();


    // ========================================================
    // LINK ALL COMPLAINTS TO THE CLUSTER
    // ========================================================

    $linkClusterStmt = $pdo->prepare("
        INSERT INTO tbl_emergency_cluster_complaints
        (
            clusterID,
            complaintID,
            isRepresentative
        )
        VALUES
        (
            ?,
            ?,
            ?
        )
    ");

    foreach ($complaints as $complaint) {

        $complaintID = (int) $complaint["complaintID"];

        $isRepresentative =
            ($complaintID === $representativeComplaintID)
                ? 1
                : 0;

        $linkClusterStmt->execute([
            $clusterID,
            $complaintID,
            $isRepresentative
        ]);

    }


    // ========================================================
    // UPDATE DISPATCH TEAM
    // ========================================================

    if (
        $team["status"] === "Available" &&
        empty($team["currentComplaintID"])
    ) {

        $teamUpdateStmt = $pdo->prepare("
            UPDATE tbl_dispatch_teams
            SET
                status = 'Dispatched',
                currentComplaintID = ?
            WHERE teamID = ?
        ");

        $teamUpdateStmt->execute([
            $representativeComplaintID,
            $teamID
        ]);

    } else {

        $teamUpdateStmt = $pdo->prepare("
            UPDATE tbl_dispatch_teams
            SET status = 'Dispatched'
            WHERE teamID = ?
        ");

        $teamUpdateStmt->execute([
            $teamID
        ]);

    }


    // ========================================================
    // PREPARE COMPLAINT UPDATE
    // ========================================================

    $updateComplaintStmt = $pdo->prepare("
        UPDATE tbl_complaints
        SET
            status = 'In Progress',
            dispatchTeamID = ?,
            dispatchStatus = 'Assigned',
            firstResponseAt =
                COALESCE(firstResponseAt, NOW())
        WHERE complaintID = ?
          AND status = 'Verified'
          AND dispatchTeamID IS NULL
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
            'dispatched',
            0
        )
    ");


    // ========================================================
    // NOTIFICATION MESSAGES
    // ========================================================

    $dispatchNotificationTitle =
        "Response Team Dispatched";

    $dispatchNotificationMessage =
        "A response team has been dispatched to an emergency " .
        "incident affecting your reported area. Your complaint " .
        "is now being handled.";

    $acceptedNotificationTitle =
        "Complaint Accepted";

    $acceptedNotificationMessage =
        "Your complaint has been accepted by the response team " .
        "and is now part of an active emergency response.";


    // ========================================================
    // EMAIL QUEUE AND COUNTERS
    // ========================================================

    /*
     * Store only newly created notifications.
     * Emails will be sent after the transaction commits.
     */

    $emailsToSend = [];

    $assignedCount = 0;

    $notificationsCreated = 0;


    // ========================================================
    // PROCESS EVERY LINKED COMPLAINT
    // ========================================================

    foreach ($complaints as $complaint) {

        $complaintID = (int) $complaint["complaintID"];

        $citizenID = (int) $complaint["citizenID"];

        $citizenName = (string) (
            $complaint["fullName"] ?? ''
        );

        $citizenEmail = trim(
            (string) ($complaint["email"] ?? '')
        );

        $complaintReference = trim(
            (string) (
                $complaint["complaintReference"] ?? ''
            )
        );


        // ====================================================
        // UPDATE COMPLAINT
        // ====================================================

        $updateComplaintStmt->execute([
            $teamID,
            $complaintID
        ]);

        if ($updateComplaintStmt->rowCount() !== 1) {

            throw new Exception(
                "Unable to assign complaint #" .
                $complaintID .
                " to the dispatch team."
            );

        }


        // ====================================================
        // PROCESS BOTH CITIZEN NOTIFICATIONS
        // ====================================================

        $notificationDefinitions = [
            [
                "title" => $dispatchNotificationTitle,
                "message" => $dispatchNotificationMessage
            ],
            [
                "title" => $acceptedNotificationTitle,
                "message" => $acceptedNotificationMessage
            ]
        ];

        foreach (
            $notificationDefinitions as $notification
        ) {

            $title = $notification["title"];

            $message = $notification["message"];


            // ================================================
            // CHECK FOR EXISTING NOTIFICATION
            // ================================================

            $checkNotificationStmt->execute([
                $citizenID,
                $complaintID,
                $title
            ]);

            $existingNotification =
                $checkNotificationStmt->fetchColumn();


            // ================================================
            // CREATE NOTIFICATION ONLY ONCE
            // ================================================

            if ($existingNotification) {

                continue;

            }

            $notificationStmt->execute([
                $citizenID,
                $complaintID,
                $title,
                $message
            ]);

            $notificationsCreated++;


            // ================================================
            // QUEUE EMAIL FOR AFTER COMMIT
            // ================================================

            $emailsToSend[] = [
                "email" => $citizenEmail,
                "name" => $citizenName,
                "complaintReference" => $complaintReference,
                "complaintID" => $complaintID,
                "title" => $title,
                "message" => $message
            ];

        }


        // ====================================================
        // OPERATIONAL LOG
        // ====================================================

        logOperation(
            $pdo,
            "system",
            null,
            "Dispatch Team #" . $teamID,
            "Emergency Incident Dispatched",
            "Complaint #{$complaintID} was linked to emergency incident {$clusterReference} and assigned to dispatch team #{$teamID}.",
            $complaintID,
            "Verified",
            "In Progress"
        );


        $assignedCount++;

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


        // ====================================================
        // VALIDATE CITIZEN EMAIL
        // ====================================================

        if (
            !filter_var(
                $citizenEmail,
                FILTER_VALIDATE_EMAIL
            )
        ) {

            $emailsSkipped++;

            error_log(
                "Invalid citizen email for emergency dispatch. " .
                "Complaint ID: " .
                $emailData["complaintID"] .
                " | Notification: " .
                $emailData["title"]
            );

            continue;

        }


        // ====================================================
        // SEND EMAIL
        // ====================================================

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
                    "Could not send emergency dispatch email. " .
                    "Complaint ID: " .
                    $emailData["complaintID"] .
                    " | Notification: " .
                    $emailData["title"]
                );

            }

        } catch (Throwable $emailException) {

            $emailsFailed++;

            error_log(
                "Emergency dispatch email exception. " .
                "Complaint ID: " .
                $emailData["complaintID"] .
                " | Notification: " .
                $emailData["title"] .
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
        "Emergency incident dispatched successfully.",
        [
            "clusterID" => $clusterID,
            "clusterReference" => $clusterReference,
            "severity" => $severity,
            "category" => $category,
            "teamID" => $teamID,
            "teamName" => $team["teamName"],
            "representativeComplaintID" => $representativeComplaintID,
            "assignedCount" => $assignedCount,
            "currentComplaintID" => $representativeComplaintID,
            "notificationsCreated" => $notificationsCreated,
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
        "EMERGENCY DISPATCH ERROR: " .
        $e->getMessage()
    );

    jsonResponse(
        false,
        "Unable to dispatch the emergency incident. Please try again."
    );

}

?>
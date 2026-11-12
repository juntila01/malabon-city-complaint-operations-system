<?php

header("Content-Type: application/json");

require_once "../db.php";
require_once "../Reports/log_operation.php";
require_once "../Cores/send_citizen_notification.php";

session_start();


// ============================================================
// RESPONSE HELPER
// ============================================================

function responseJson(
    bool $success,
    string $message,
    array $extra = []
) {
    echo json_encode(
        array_merge(
            [
                "success" => $success,
                "message" => $message
            ],
            $extra
        )
    );

    exit;
}


// ============================================================
// ONLY POST
// ============================================================

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    responseJson(
        false,
        "Invalid request method. POST is required."
    );
}


// ============================================================
// CHECK DISPATCH TEAM SESSION
// ============================================================

$teamID =
    $_SESSION["team_id"]
    ?? $_SESSION["dispatchTeamID"]
    ?? $_SESSION["teamID"]
    ?? $_SESSION["dispatch_team_id"]
    ?? null;

if (!$teamID) {
    responseJson(
        false,
        "Dispatch team session not found. Please log in again."
    );
}

$teamID = (int) $teamID;

if ($teamID <= 0) {
    responseJson(
        false,
        "Invalid dispatch team session."
    );
}


// ============================================================
// READ JSON REQUEST
// ============================================================

$input = json_decode(
    file_get_contents("php://input"),
    true
);

if (!is_array($input)) {
    responseJson(
        false,
        "Invalid JSON request."
    );
}

$complaintID = isset($input["complaintID"])
    ? (int) $input["complaintID"]
    : 0;

$status = isset($input["status"])
    ? trim($input["status"])
    : "";

if ($complaintID <= 0) {
    responseJson(
        false,
        "Invalid complaint ID."
    );
}

if ($status === "") {
    responseJson(
        false,
        "Status is required."
    );
}


// ============================================================
// NORMALIZE STATUS
// ============================================================

$statusKey = strtolower(
    preg_replace(
        "/\s+/",
        " ",
        $status
    )
);

$statusMap = [
    "assigned" => "Assigned",
    "on the way" => "On the Way",
    "arrived" => "Arrived",
    "resolved" => "Resolved",
    "unable to resolve" => "Unable to Resolve"
];

if (!isset($statusMap[$statusKey])) {
    responseJson(
        false,
        "Invalid dispatch status."
    );
}

$newStatus = $statusMap[$statusKey];


// ============================================================
// EMAIL RESULT DEFAULTS
// ============================================================

$emailSentCount = 0;
$emailFailedCount = 0;
$totalEmails = 0;


// ============================================================
// DATABASE TRANSACTION
// ============================================================

try {

    $pdo->beginTransaction();


    // ========================================================
    // VERIFY DISPATCH TEAM
    // ========================================================

    $teamStmt = $pdo->prepare("
        SELECT
            teamID,
            teamName,
            status,
            currentComplaintID
        FROM tbl_dispatch_teams
        WHERE teamID = ?
        LIMIT 1
        FOR UPDATE
    ");

    $teamStmt->execute([
        $teamID
    ]);

    $team = $teamStmt->fetch(PDO::FETCH_ASSOC);

    if (!$team) {
        throw new Exception(
            "Dispatch team account could not be found."
        );
    }


    // ========================================================
    // GET COMPLAINT AND CITIZEN DETAILS
    // ========================================================
    //
    // Citizen information is needed for email notifications.
    //
    // ========================================================

    $complaintStmt = $pdo->prepare("
        SELECT
            c.complaintID,
            c.citizenID,
            c.complaintReference,
            c.dispatchTeamID,
            c.dispatchStatus,
            c.firstResponseAt,
            c.completedAt,
            u.fullName,
            u.email
        FROM tbl_complaints c
        LEFT JOIN tbl_citizens u
            ON u.citizenID = c.citizenID
        WHERE c.complaintID = ?
        LIMIT 1
        FOR UPDATE
    ");

    $complaintStmt->execute([
        $complaintID
    ]);

    $complaint = $complaintStmt->fetch(PDO::FETCH_ASSOC);

    if (!$complaint) {
        throw new Exception(
            "Complaint could not be found."
        );
    }


    // ========================================================
    // VERIFY ASSIGNMENT
    // ========================================================

    if (
        (int) $complaint["dispatchTeamID"] !== $teamID
    ) {
        throw new Exception(
            "This complaint is not assigned to your dispatch team."
        );
    }


    // ========================================================
    // CHECK FOR ACTIVE EMERGENCY INCIDENT
    // ========================================================

    $emergencyClusterStmt = $pdo->prepare("
        SELECT
            ec.clusterID,
            ec.clusterReference,
            ec.status
        FROM tbl_emergency_clusters ec
        INNER JOIN tbl_emergency_cluster_complaints ecc
            ON ecc.clusterID = ec.clusterID
        WHERE ecc.complaintID = ?
          AND ec.status NOT IN (
              'Resolved',
              'Unable to Resolve'
          )
        LIMIT 1
    ");

    $emergencyClusterStmt->execute([
        $complaintID
    ]);

    $emergencyCluster = $emergencyClusterStmt->fetch(
        PDO::FETCH_ASSOC
    );


    // ========================================================
    // GET ALL COMPLAINTS IN THE EMERGENCY INCIDENT
    // ========================================================

    $emergencyComplaintIDs = [];

    if ($emergencyCluster) {

        $clusterStmt = $pdo->prepare("
            SELECT complaintID
            FROM tbl_emergency_cluster_complaints
            WHERE clusterID = ?
            ORDER BY complaintID ASC
        ");

        $clusterStmt->execute([
            $emergencyCluster["clusterID"]
        ]);

        $emergencyComplaintIDs = array_map(
            "intval",
            $clusterStmt->fetchAll(PDO::FETCH_COLUMN)
        );

        if (empty($emergencyComplaintIDs)) {
            throw new Exception(
                "No complaints were found in the emergency incident."
            );
        }
    }


    // ========================================================
    // CURRENT STATUS
    // ========================================================

    $currentStatus = strtolower(
        preg_replace(
            "/\s+/",
            " ",
            trim($complaint["dispatchStatus"] ?? "")
        )
    );


    // ========================================================
    // VALIDATE STATUS TRANSITION
    // ========================================================

    $validTransition = false;

    if (
        $currentStatus === "assigned" &&
        $newStatus === "On the Way"
    ) {
        $validTransition = true;
    } elseif (
        $currentStatus === "on the way" &&
        $newStatus === "Arrived"
    ) {
        $validTransition = true;
    } elseif (
        $currentStatus === "arrived" &&
        (
            $newStatus === "Resolved" ||
            $newStatus === "Unable to Resolve"
        )
    ) {
        $validTransition = true;
    }

    if (!$validTransition) {
        throw new Exception(
            "Invalid status transition. Current status is: " .
            (
                $complaint["dispatchStatus"]
                ?: "Not assigned"
            )
        );
    }


    // ========================================================
    // UPDATE COMPLAINT OR EMERGENCY INCIDENT
    // ========================================================

    if ($emergencyCluster) {

        /*
         * Emergency incidents update all linked complaints
         * together when the team is On the Way or Arrived.
         *
         * Resolution remains handled by the existing
         * resolveComplaint.php / unableToResolve.php endpoints.
         */

        if (
            $newStatus === "On the Way" ||
            $newStatus === "Arrived"
        ) {

            $placeholders = implode(
                ",",
                array_fill(
                    0,
                    count($emergencyComplaintIDs),
                    "?"
                )
            );

            if ($newStatus === "On the Way") {

                $updateComplaint = $pdo->prepare("
                    UPDATE tbl_complaints
                    SET
                        dispatchStatus = 'On the Way',
                        firstResponseAt = COALESCE(
                            firstResponseAt,
                            NOW()
                        )
                    WHERE complaintID IN ($placeholders)
                      AND dispatchTeamID = ?
                ");

                $params = array_merge(
                    $emergencyComplaintIDs,
                    [$teamID]
                );

                $updateComplaint->execute($params);

                $clusterUpdate = $pdo->prepare("
                    UPDATE tbl_emergency_clusters
                    SET status = 'On the Way'
                    WHERE clusterID = ?
                ");

                $clusterUpdate->execute([
                    $emergencyCluster["clusterID"]
                ]);

            } elseif ($newStatus === "Arrived") {

                $updateComplaint = $pdo->prepare("
                    UPDATE tbl_complaints
                    SET dispatchStatus = 'Arrived'
                    WHERE complaintID IN ($placeholders)
                      AND dispatchTeamID = ?
                ");

                $params = array_merge(
                    $emergencyComplaintIDs,
                    [$teamID]
                );

                $updateComplaint->execute($params);

                $clusterUpdate = $pdo->prepare("
                    UPDATE tbl_emergency_clusters
                    SET status = 'Arrived'
                    WHERE clusterID = ?
                ");

                $clusterUpdate->execute([
                    $emergencyCluster["clusterID"]
                ]);

            }
        }

    } else {

        // ====================================================
        // NORMAL SINGLE COMPLAINT
        // ====================================================

        if ($newStatus === "On the Way") {

            $updateComplaint = $pdo->prepare("
                UPDATE tbl_complaints
                SET
                    dispatchStatus = 'On the Way',
                    firstResponseAt = COALESCE(
                        firstResponseAt,
                        NOW()
                    )
                WHERE complaintID = ?
                  AND dispatchTeamID = ?
            ");

            $updateComplaint->execute([
                $complaintID,
                $teamID
            ]);

        } elseif ($newStatus === "Arrived") {

            $updateComplaint = $pdo->prepare("
                UPDATE tbl_complaints
                SET dispatchStatus = 'Arrived'
                WHERE complaintID = ?
                  AND dispatchTeamID = ?
            ");

            $updateComplaint->execute([
                $complaintID,
                $teamID
            ]);

        } elseif ($newStatus === "Resolved") {

            $updateComplaint = $pdo->prepare("
                UPDATE tbl_complaints
                SET
                    dispatchStatus = 'Resolved',
                    completedAt = NOW()
                WHERE complaintID = ?
                  AND dispatchTeamID = ?
            ");

            $updateComplaint->execute([
                $complaintID,
                $teamID
            ]);

        } elseif ($newStatus === "Unable to Resolve") {

            $updateComplaint = $pdo->prepare("
                UPDATE tbl_complaints
                SET
                    dispatchStatus = 'Unable to Resolve',
                    completedAt = NOW()
                WHERE complaintID = ?
                  AND dispatchTeamID = ?
            ");

            $updateComplaint->execute([
                $complaintID,
                $teamID
            ]);

        }
    }


    // ========================================================
    // PREPARE CITIZEN NOTIFICATION
    // ========================================================

    $notificationTitle = "";
    $notificationMessage = "";

    switch ($newStatus) {

        case "On the Way":

            $notificationTitle =
                "Dispatch Team Is On the Way";

            $notificationMessage =
                "The dispatch team assigned to your complaint has started responding and is now on the way.";

            break;

        case "Arrived":

            $notificationTitle =
                "Dispatch Team Has Arrived";

            $notificationMessage =
                "The dispatch team has arrived at the location of your complaint.";

            break;

        case "Resolved":

            $notificationTitle =
                "Complaint Resolved";

            $notificationMessage =
                "The dispatch team has marked your complaint as resolved.";

            break;

        case "Unable to Resolve":

            $notificationTitle =
                "Complaint Update";

            $notificationMessage =
                "The dispatch team was unable to resolve your complaint. Please check the complaint details for more information.";

            break;
    }


    // ========================================================
    // PREPARE CITIZENS TO NOTIFY
    // ========================================================
    //
    // For emergency incidents, notify every linked citizen.
    // For normal complaints, notify only the complaint citizen.
    //
    // Keep one notification per citizen per status update.
    //
    // ========================================================

    $citizensToNotify = [];

    if (
        $notificationTitle !== "" &&
        !empty($complaint["citizenID"])
    ) {

        if ($emergencyCluster) {

            $citizenQuery = $pdo->prepare("
                SELECT DISTINCT
                    c.complaintID,
                    c.citizenID,
                    c.complaintReference,
                    u.fullName,
                    u.email
                FROM tbl_emergency_cluster_complaints ecc
                INNER JOIN tbl_complaints c
                    ON c.complaintID = ecc.complaintID
                LEFT JOIN tbl_citizens u
                    ON u.citizenID = c.citizenID
                WHERE ecc.clusterID = ?
                  AND c.dispatchTeamID = ?
                ORDER BY c.complaintID ASC
            ");

            $citizenQuery->execute([
                $emergencyCluster["clusterID"],
                $teamID
            ]);

            $citizensToNotify = $citizenQuery->fetchAll(
                PDO::FETCH_ASSOC
            );

        } else {

            $citizensToNotify = [
                [
                    "complaintID" => $complaint["complaintID"],
                    "citizenID" => $complaint["citizenID"],
                    "complaintReference" => $complaint["complaintReference"],
                    "fullName" => $complaint["fullName"],
                    "email" => $complaint["email"]
                ]
            ];

        }
    }


    // ========================================================
    // INSERT IN-APP NOTIFICATIONS
    // ========================================================

    $notificationStmt = $pdo->prepare("
        INSERT INTO tbl_notifications
        (
            citizenID,
            complaintID,
            title,
            message,
            type
        )
        VALUES
        (
            ?,
            ?,
            ?,
            ?,
            'complaint'
        )
    ");

    foreach ($citizensToNotify as $citizen) {

        if (empty($citizen["citizenID"])) {
            continue;
        }

        $notificationStmt->execute([
            $citizen["citizenID"],
            $citizen["complaintID"],
            $notificationTitle,
            $notificationMessage
        ]);
    }


    // ========================================================
    // UPDATE DISPATCH TEAM
    // ========================================================

    if (
        $newStatus === "On the Way" ||
        $newStatus === "Arrived"
    ) {

        $teamUpdate = $pdo->prepare("
            UPDATE tbl_dispatch_teams
            SET
                status = 'Dispatched',
                currentComplaintID = ?
            WHERE teamID = ?
        ");

        $teamUpdate->execute([
            $complaintID,
            $teamID
        ]);

    } elseif (
        $newStatus === "Resolved" ||
        $newStatus === "Unable to Resolve"
    ) {

        $teamUpdate = $pdo->prepare("
            UPDATE tbl_dispatch_teams
            SET
                status = 'Available',
                currentComplaintID = NULL
            WHERE teamID = ?
        ");

        $teamUpdate->execute([
            $teamID
        ]);

    }


    // ========================================================
    // CREATE DISPATCH LOG
    // ========================================================

    $logAction = match ($newStatus) {

        "On the Way" =>
            "Dispatch Started",

        "Arrived" =>
            "Arrived at Location",

        "Resolved" =>
            "Complaint Resolved",

        "Unable to Resolve" =>
            "Unable to Resolve",

        default =>
            "Status Updated"
    };

    $logDetails = match ($newStatus) {

        "On the Way" =>
            "Dispatch team started travelling to the complaint location.",

        "Arrived" =>
            "Dispatch team arrived at the complaint location.",

        "Resolved" =>
            "Dispatch team marked the complaint as resolved.",

        "Unable to Resolve" =>
            "Dispatch team marked the complaint as unable to resolve.",

        default =>
            "Complaint dispatch status updated."
    };


    $logStmt = $pdo->prepare("
        INSERT INTO tbl_dispatch_logs
        (
            complaintID,
            systemUserID,
            dispatchTeamID,
            action,
            details
        )
        VALUES
        (
            ?,
            NULL,
            ?,
            ?,
            ?
        )
    ");

    $logStmt->execute([
        $complaintID,
        $teamID,
        $logAction,
        $logDetails
    ]);


    // ========================================================
    // SYSTEM AUDIT LOG
    // ========================================================

    logOperation(
        $pdo,
        "Dispatch Team",
        $teamID,
        $team["teamName"] ?? "Dispatch Team",
        $logAction,
        $logDetails,
        $complaintID,
        $complaint["dispatchStatus"] ?? null,
        $newStatus
    );


    // ========================================================
    // COMMIT TRANSACTION
    // ========================================================

    $pdo->commit();


    // ========================================================
    // SEND CITIZEN EMAIL NOTIFICATIONS
    // ========================================================
    //
    // Emails are sent only after the database commit succeeds.
    // Email failures do not roll back complaint status updates.
    //
    // ========================================================

    foreach ($citizensToNotify as $citizen) {

        $citizenEmail = trim(
            $citizen["email"] ?? ""
        );

        $citizenName = trim(
            $citizen["fullName"] ?? ""
        );

        if ($citizenName === "") {
            $citizenName = "Citizen";
        }

        $complaintReference = trim(
            $citizen["complaintReference"] ?? ""
        );

        if ($complaintReference === "") {
            $complaintReference = null;
        }

        if (
            !filter_var(
                $citizenEmail,
                FILTER_VALIDATE_EMAIL
            )
        ) {

            $emailFailedCount++;

            error_log(
                "Dispatch status email skipped: invalid or missing email for complaint #" .
                $citizen["complaintID"]
            );

            continue;
        }

        $totalEmails++;

        try {

            $emailResult = sendCitizenNotificationEmail(
                $citizenEmail,
                $citizenName,
                $notificationTitle,
                $notificationMessage,
                $complaintReference
            );

            if ($emailResult === false) {

                $emailFailedCount++;

                error_log(
                    "Dispatch status email failed for complaint #" .
                    $citizen["complaintID"] .
                    ": " . $notificationTitle
                );

            } else {

                $emailSentCount++;

            }

        } catch (Throwable $emailError) {

            $emailFailedCount++;

            error_log(
                "Dispatch status email error for complaint #" .
                $citizen["complaintID"] .
                ": " . $emailError->getMessage()
            );

        }
    }


    // ========================================================
    // SUCCESS RESPONSE
    // ========================================================

    responseJson(
        true,
        "Complaint status updated successfully.",
        [
            "complaintID" => $complaintID,
            "dispatchStatus" => $newStatus,
            "teamID" => $teamID,
            "emailsSentCount" => $emailSentCount,
            "emailsFailedCount" => $emailFailedCount
        ]
    );

} catch (Throwable $e) {

    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    error_log(
        "updateDispatchStatus.php ERROR: " .
        $e->getMessage()
    );

    responseJson(
        false,
        "Server error while updating dispatch status.",
        [
            "debug" => $e->getMessage(),
            "file" => $e->getFile(),
            "line" => $e->getLine()
        ]
    );
}
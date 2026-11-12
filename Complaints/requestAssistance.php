<?php

// requestAssistance.php

error_reporting(E_ALL);
ini_set('display_errors', 0);

session_start();

header("Content-Type: application/json");

require_once "../db.php";
require_once "../Reports/log_operation.php";


/* ============================================================
   RESPONSE HELPER
============================================================ */

function respond(
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
   AUTHENTICATION
============================================================ */

if (
    empty($_SESSION['logged_in']) ||
    $_SESSION['logged_in'] !== true
) {

    respond(
        false,
        "Unauthorized. Please log in again."
    );

}


if (
    ($_SESSION['user_type'] ?? '') !== 'dispatch_team'
) {

    respond(
        false,
        "Unauthorized. Dispatch Team access required."
    );

}


$teamID =
    (int) ($_SESSION['team_id'] ?? 0);


if ($teamID <= 0) {

    respond(
        false,
        "Dispatch Team ID not found in session."
    );

}


/* ============================================================
   READ JSON REQUEST
============================================================ */

$input =
    json_decode(
        file_get_contents("php://input"),
        true
    );


if (!is_array($input)) {

    respond(
        false,
        "Invalid request data."
    );

}


$complaintID =
    (int) ($input['complaintID'] ?? 0);


$reason =
    trim(
        $input['reason'] ?? ''
    );


$details =
    trim(
        $input['details'] ?? ''
    );


if ($complaintID <= 0) {

    respond(
        false,
        "Invalid complaint ID."
    );

}


if ($reason === '') {

    respond(
        false,
        "Assistance reason is required."
    );

}


/* ============================================================
   GET COMPLAINT
============================================================ */

try {

    $stmt = $pdo->prepare("
        SELECT
            complaintID,
            dispatchTeamID,
            dispatchStatus
        FROM tbl_complaints
        WHERE complaintID = :complaintID
          AND dispatchTeamID = :teamID
        LIMIT 1
    ");

    $stmt->execute([
        ":complaintID" => $complaintID,
        ":teamID" => $teamID
    ]);

    $complaint =
        $stmt->fetch(PDO::FETCH_ASSOC);


    if (!$complaint) {

        respond(
            false,
            "This complaint is not assigned to your dispatch team."
        );

    }


    /* ========================================================
       CHECK DISPATCH STATUS
    ======================================================== */

    $currentStatus =
        strtolower(
            trim(
                $complaint['dispatchStatus'] ?? ''
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
            "Assistance cannot be requested for this complaint in its current status."
        );

    }


    /* ========================================================
       TRANSACTION
    ======================================================== */

    $pdo->beginTransaction();


    /* ========================================================
       CREATE ASSISTANCE LOG
    ======================================================== */

    $logDetails =
        $reason;


    if ($details !== '') {

        $logDetails .=
            " - " . $details;

    }


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
            'Assistance Requested',
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
       COMMIT
    ======================================================== */

    $pdo->commit();


    /* ========================================================
       OPERATIONAL LOG
    ======================================================== */

    logOperation(
        $pdo,
        "dispatch_team",
        $teamID,
        $_SESSION['team_name'] ?? "Dispatch Team",
        "ASSISTANCE_REQUESTED",
        "Dispatch team requested assistance for complaint #{$complaintID}. Reason: {$logDetails}",
        $complaintID,
        null,
        "Assistance Requested"
    );


    respond(
        true,
        "Assistance request sent successfully.",
        [
            "complaintID" => $complaintID
        ]
    );


}
catch (Throwable $e) {

    if ($pdo->inTransaction()) {

        $pdo->rollBack();

    }


    error_log(
        "REQUEST ASSISTANCE ERROR: " .
        $e->getMessage()
    );


    respond(
        false,
        $e->getMessage()
    );

}
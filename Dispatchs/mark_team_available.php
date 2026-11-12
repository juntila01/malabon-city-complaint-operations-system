<?php

header("Content-Type: application/json; charset=utf-8");

require_once "../Cores/auth.php";
requireRole(['admin']);

require_once "../db.php";
require_once "../Reports/log_operation.php";


/* ============================================================
   AUTHENTICATED USER
============================================================ */

$department = currentDepartment();

/*
 * Global/Main Admin:
 *     department = ""
 *     Can release any dispatch team.
 *
 * Department Admin:
 *     department = BFP / MCAT / PSTMO
 *     Can release only their own department's team.
 */


/* ============================================================
   READ JSON REQUEST
============================================================ */

$data = json_decode(
    file_get_contents("php://input"),
    true
);

$teamID = filter_var(
    $data["teamID"] ?? null,
    FILTER_VALIDATE_INT
);

if (!$teamID) {

    echo json_encode([
        "success" => false,
        "message" => "Missing or invalid team ID."
    ]);

    exit;
}


try {

    /* ========================================================
       GET DISPATCH TEAM
    ======================================================== */

    if ($department === "") {

        /*
         * Global/Main Admin
         */
        $stmt = $pdo->prepare("
            SELECT
                teamID,
                teamName,
                department,
                currentComplaintID
            FROM tbl_dispatch_teams
            WHERE teamID = ?
            LIMIT 1
        ");

        $stmt->execute([
            $teamID
        ]);

    } else {

        /*
         * Department Admin
         *
         * IMPORTANT:
         * Department comes ONLY from the authenticated session.
         */

        $stmt = $pdo->prepare("
            SELECT
                teamID,
                teamName,
                department,
                currentComplaintID
            FROM tbl_dispatch_teams
            WHERE teamID = ?
              AND department = ?
            LIMIT 1
        ");

        $stmt->execute([
            $teamID,
            $department
        ]);
    }


    $team = $stmt->fetch(PDO::FETCH_ASSOC);


    /* ========================================================
       TEAM NOT FOUND / NOT AUTHORIZED
    ======================================================== */

    if (!$team) {

        http_response_code(403);

        echo json_encode([
            "success" => false,
            "message" =>
                "You are not authorized to manage this dispatch team."
        ]);

        exit;
    }


    /* ========================================================
       CHECK FOR CURRENT / QUEUED COMPLAINTS
    ======================================================== */

    $stmt = $pdo->prepare("
        SELECT
            complaintID,
            dispatchStatus
        FROM tbl_complaints
        WHERE dispatchTeamID = ?
          AND dispatchStatus IN (
              'Assigned',
              'On the Way',
              'Arrived'
          )
        ORDER BY createdAt ASC
    ");

    $stmt->execute([
        $teamID
    ]);

    $activeComplaints =
        $stmt->fetchAll(PDO::FETCH_ASSOC);


    /* ========================================================
       DO NOT FREE TEAM IF COMPLAINTS ARE STILL ACTIVE
    ======================================================== */

    if (!empty($activeComplaints)) {

        throw new Exception(
            "This dispatch team still has active or queued complaints."
        );
    }


    /* ========================================================
       MAKE TEAM AVAILABLE
    ======================================================== */

    $stmt = $pdo->prepare("
        UPDATE tbl_dispatch_teams
        SET
            status = 'Available',
            currentComplaintID = NULL
        WHERE teamID = ?
    ");

    $stmt->execute([
        $teamID
    ]);


    /* ========================================================
       LOG OPERATION
    ======================================================== */

    logOperation(
        "Dispatch Team Available",
        "Dispatch team #{$teamID} (" .
        $team['teamName'] .
        " - " .
        $team['department'] .
        ") was marked as Available and released from its current complaint."
    );


    /* ========================================================
       SUCCESS
    ======================================================== */

    echo json_encode([
        "success" => true,
        "message" => "Dispatch team is now available."
    ]);

}
catch (Throwable $e) {

    error_log(
        "mark_team_available.php: " .
        $e->getMessage()
    );

    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}
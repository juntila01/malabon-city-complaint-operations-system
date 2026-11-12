<?php

error_reporting(E_ALL);
ini_set('display_errors', 0);

header('Content-Type: application/json; charset=utf-8');

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once "../Cores/auth.php";
requireRole(['admin']);

require_once "../db.php";
require_once "../Reports/log_operation.php";


/* ============================================================
   JSON RESPONSE
============================================================ */

function jsonResponse(
    bool $success,
    string $message = "",
    array $data = [],
    int $httpCode = 200
): void {

    http_response_code($httpCode);

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
   REQUEST METHOD
============================================================ */

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {

    jsonResponse(
        false,
        "Invalid request method.",
        [],
        405
    );

}


/* ============================================================
   AUTHENTICATED USER
============================================================ */

$department = currentDepartment();

$isMainAdmin = ($department === "");


/* ============================================================
   GET TEAM ID
============================================================ */

$input = json_decode(
    file_get_contents("php://input"),
    true
);

$teamID = filter_var(
    $input['teamID'] ?? null,
    FILTER_VALIDATE_INT
);

if (!$teamID || $teamID <= 0) {

    jsonResponse(
        false,
        "Invalid dispatch team ID.",
        [],
        400
    );

}


/* ============================================================
   GET DISPATCH TEAM
============================================================ */

try {

    /*
     * Main Admin:
     *     Can delete any dispatch team.
     *
     * Department Admin:
     *     Can delete only a team belonging to their department.
     *
     * IMPORTANT:
     * The department comes from the authenticated session.
     * It is NOT taken from POST.
     */

    if ($isMainAdmin) {

        $sql = "
            SELECT
                teamID,
                teamName,
                department,
                teamLeader,
                email,
                status,
                currentComplaintID
            FROM tbl_dispatch_teams
            WHERE teamID = :teamID
            LIMIT 1
        ";

        $params = [
            ':teamID' => $teamID
        ];

    } else {

        $sql = "
            SELECT
                teamID,
                teamName,
                department,
                teamLeader,
                email,
                status,
                currentComplaintID
            FROM tbl_dispatch_teams
            WHERE teamID = :teamID
              AND department = :department
            LIMIT 1
        ";

        $params = [
            ':teamID' => $teamID,
            ':department' => $department
        ];

    }


    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    $team = $stmt->fetch(PDO::FETCH_ASSOC);


    /* ========================================================
       TEAM NOT FOUND / NOT AUTHORIZED
    ======================================================== */

    if (!$team) {

        jsonResponse(
            false,
            "Dispatch team not found or you are not authorized to delete it.",
            [],
            404
        );

    }


    /* ========================================================
       PREVENT DELETE WHILE TEAM IS ASSIGNED
    ======================================================== */

    if (
        isset($team['currentComplaintID']) &&
        $team['currentComplaintID'] !== null &&
        $team['currentComplaintID'] !== ''
    ) {

        jsonResponse(
            false,
            "This dispatch team currently has an assigned complaint. Resolve or remove the assignment before deleting the team.",
            [],
            409
        );

    }


    /* ========================================================
       DELETE TEAM
    ======================================================== */

    $deleteStmt = $pdo->prepare("
        DELETE FROM tbl_dispatch_teams
        WHERE teamID = :teamID
    ");

    $deleteStmt->execute([
        ':teamID' => $teamID
    ]);


    if ($deleteStmt->rowCount() === 0) {

        jsonResponse(
            false,
            "Dispatch team could not be deleted.",
            [],
            404
        );

    }


    /* ========================================================
       ACTIVITY LOG
    ======================================================== */

    try {

        logOperation(
            $pdo,
            'DELETE_DISPATCH_TEAM',
            'Dispatch Team',
            $teamID,
            "Deleted dispatch team: " .
                $team['teamName'] .
                " (" .
                $team['department'] .
                ")"
        );

    } catch (Throwable $logError) {

        /*
         * Do not undo a successful deletion only because
         * activity logging failed.
         */

        error_log(
            "delete_dispatchteam.php activity log error: " .
            $logError->getMessage()
        );

    }


    /* ========================================================
       SUCCESS
    ======================================================== */

    jsonResponse(
        true,
        "Dispatch team deleted successfully.",
        [
            "teamID" => (int) $teamID
        ]
    );


}
catch (PDOException $e) {

    error_log(
        "delete_dispatchteam.php: " .
        $e->getMessage()
    );

    jsonResponse(
        false,
        "Database error while deleting dispatch team.",
        [],
        500
    );

}
catch (Throwable $e) {

    error_log(
        "delete_dispatchteam.php unexpected error: " .
        $e->getMessage()
    );

    jsonResponse(
        false,
        "An unexpected error occurred.",
        [],
        500
    );

}
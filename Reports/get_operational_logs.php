<?php

error_reporting(E_ALL);
ini_set('display_errors', 1);

session_start();

header('Content-Type: application/json');

require_once "../Cores/auth.php";

requireRole(['admin']);

require_once "../db.php";


/* ============================================================
   GET USER DEPARTMENT
============================================================ */

$userDepartment =
    strtoupper(
        trim(
            $_SESSION['department'] ?? ''
        )
    );


/* ============================================================
   BUILD DEPARTMENT ACCESS FILTER
============================================================ */

$departmentCondition = "";

if ($userDepartment === "IT") {

    /*
     * IT can see all operational logs.
     */

    $departmentCondition = "";

}
elseif ($userDepartment === "BFP") {

    /*
     * BFP handles:
     * - Fire
     * - Flood HIGH
     */

    $departmentCondition = "
        AND (
            UPPER(TRIM(ai.category)) = 'FIRE'

            OR

            (
                UPPER(TRIM(ai.category)) = 'FLOOD'
                AND UPPER(TRIM(ai.urgency)) = 'HIGH'
            )
        )
    ";

}
elseif ($userDepartment === "MCAT") {

    /*
     * MCAT handles:
     * - Obstruction
     * - Flood NORMAL
     */

    $departmentCondition = "
        AND (
            UPPER(TRIM(ai.category)) = 'OBSTRUCTION'

            OR

            (
                UPPER(TRIM(ai.category)) = 'FLOOD'
                AND UPPER(TRIM(ai.urgency)) = 'NORMAL'
            )
        )
    ";

}
elseif ($userDepartment === "PSTMO") {

    /*
     * PSTMO handles:
     * - Traffic
     */

    $departmentCondition = "
        AND UPPER(TRIM(ai.category)) = 'TRAFFIC'
    ";

}
else {

    /*
     * Unknown / missing department
     * should not see operational logs.
     */

    $departmentCondition = "
        AND 1 = 0
    ";

}


try {

    /* ========================================================
       GET OPERATIONAL LOGS
    ======================================================== */

    $sql = "

        SELECT

            l.logID,
            l.complaintID,
            l.actorType,
            l.actorID,
            l.actorName,
            l.action,
            l.description,
            l.oldValue,
            l.newValue,
            l.ipAddress,
            l.createdAt,

            -- AI ANALYSIS DATA
            ai.category AS aiCategory,
            ai.urgency AS aiUrgency,
            ai.location AS aiLocation,
            ai.summary AS aiSummary

        FROM tbl_operational_logs l

        LEFT JOIN tbl_ai_analysis ai
            ON ai.complaintID = l.complaintID

        WHERE 1 = 1

        $departmentCondition

        ORDER BY
            l.createdAt DESC

    ";


    $stmt =
        $pdo->prepare($sql);


    $stmt->execute();


    $logs =
        $stmt->fetchAll(
            PDO::FETCH_ASSOC
        );


    /* ========================================================
       RETURN RESULT
    ======================================================== */

    echo json_encode([

        'success' => true,

        'logs' => $logs

    ]);

}
catch (Throwable $e) {

    http_response_code(500);

    echo json_encode([

        'success' => false,

        'message' => $e->getMessage()

    ]);

}
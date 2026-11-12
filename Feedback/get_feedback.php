<?php

header("Content-Type: application/json");

session_start();

require_once "../db.php";


/* ============================================================
   RESPONSE HELPER
============================================================ */

function respond(
    array $data,
    int $statusCode = 200
): void {

    http_response_code($statusCode);

    echo json_encode($data);

    exit;
}


/* ============================================================
   CHECK LOGIN
============================================================ */

if (
    empty($_SESSION["logged_in"]) ||
    $_SESSION["logged_in"] !== true
) {

    respond([
        "success" => false,
        "message" => "User is not logged in."
    ], 401);

}


/* ============================================================
   CHECK SYSTEM USER
============================================================ */

$userType =
    strtolower(
        trim(
            $_SESSION["user_type"] ?? ""
        )
    );

if (
    $userType !== "system" &&
    $userType !== "system_user"
) {

    respond([
        "success" => false,
        "message" => "Unauthorized access."
    ], 403);

}


/* ============================================================
   GET USER DEPARTMENT
============================================================ */

$userDepartment =
    strtoupper(
        trim(
            $_SESSION["department"] ?? ""
        )
    );


/*
 * Supported departments:
 *
 * IT
 * BFP
 * MCAT
 * PSTMO
 */

$allowedDepartments = [
    "IT",
    "BFP",
    "MCAT",
    "PSTMO"
];


if (
    !in_array(
        $userDepartment,
        $allowedDepartments,
        true
    )
) {

    respond([
        "success" => false,
        "message" => "Your account has no valid department assigned."
    ], 403);

}


try {

    /* ========================================================
   DEPARTMENT ACCESS FILTER
======================================================== */

$departmentCondition = "";

$params = [];


/*
 * IT
 *
 * IT has unrestricted access.
 * No department filtering is applied.
 */

if ($userDepartment === "IT") {

    $departmentCondition = "";

}


/*
 * BFP
 *
 * BFP handles:
 * - Fire
 * - Flood HIGH
 */

elseif ($userDepartment === "BFP") {

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


/*
 * MCAT
 *
 * MCAT handles:
 * - Obstruction
 * - Flood NORMAL
 */

elseif ($userDepartment === "MCAT") {

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


/*
 * PSTMO
 *
 * PSTMO handles:
 * - Traffic
 */

elseif ($userDepartment === "PSTMO") {

    $departmentCondition = "
        AND UPPER(TRIM(ai.category)) = 'TRAFFIC'
    ";

}


    /* ========================================================
       GET FEEDBACK
    ======================================================== */

    $sql = "

        SELECT

            f.feedbackID,
            f.complaintID,
            f.rating,
            f.comments,
            f.createdAt,

            c.rawComplaintText,
            c.status,
            c.citizenID,

            ci.fullName AS citizenName,

            ai.category AS complaintCategory,
            ai.urgency AS complaintUrgency

        FROM tbl_feedback f

        INNER JOIN tbl_complaints c
            ON c.complaintID = f.complaintID

        LEFT JOIN tbl_citizens ci
            ON ci.citizenID = c.citizenID

        LEFT JOIN tbl_ai_analysis ai
            ON ai.complaintID = c.complaintID

        WHERE
            1 = 1

            $departmentCondition

        ORDER BY

            f.createdAt DESC,
            f.feedbackID DESC

    ";


    $stmt =
        $pdo->prepare($sql);


    $stmt->execute(
        $params
    );


    $feedback =
        $stmt->fetchAll(
            PDO::FETCH_ASSOC
        );


    /* ========================================================
       RETURN RESULT
    ======================================================== */

    respond([

        "success" => true,

        "department" =>
            $userDepartment,

        "count" =>
            count($feedback),

        "data" =>
            $feedback

    ]);


}


/* ============================================================
   DATABASE ERROR
============================================================ */

catch (PDOException $e) {

    error_log(
        "get_feedback.php: " .
        $e->getMessage()
    );


    respond([

        "success" => false,

        "message" =>
            "Database error while loading feedback."

    ], 500);

}


/* ============================================================
   GENERAL ERROR
============================================================ */

catch (Throwable $e) {

    error_log(
        "get_feedback.php: " .
        $e->getMessage()
    );


    respond([

        "success" => false,

        "message" =>
            "Unable to load feedback."

    ], 500);

}
?>

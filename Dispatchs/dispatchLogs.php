<?php

/* ============================================================
   MCAT DISPATCH TEAM
   Dispatch Activity Log API
   ============================================================ */

declare(strict_types=1);

header("Content-Type: application/json; charset=UTF-8");

session_start();

require_once "../db.php";


/* ============================================================
   JSON RESPONSE HELPER
============================================================ */

function response(bool $success, string $message, array $extra = []): never
{
    echo json_encode(
        array_merge(
            [
                "success" => $success,
                "message" => $message
            ],
            $extra
        ),
        JSON_UNESCAPED_UNICODE
    );

    exit;
}


/* ============================================================
   ONLY POST ALLOWED
============================================================ */

if ($_SERVER["REQUEST_METHOD"] !== "POST") {

    response(
        false,
        "Invalid request method. POST is required."
    );

}


/* ============================================================
   CHECK DATABASE
============================================================ */

if (!isset($pdo) || !($pdo instanceof PDO)) {

    response(
        false,
        "Database connection is unavailable."
    );

}


/* ============================================================
   CHECK LOGIN SESSION
============================================================ */

/*
   Adjust these session names if your login system
   uses a different session variable.

   We support several common names so the dispatch
   dashboard is easier to connect.
*/

$systemUserID =
    $_SESSION["systemUsersID"]
    ?? $_SESSION["systemUserID"]
    ?? $_SESSION["userID"]
    ?? null;


if (!$systemUserID) {

    response(
        false,
        "User session not found. Please log in again."
    );

}


/* ============================================================
   READ JSON REQUEST
============================================================ */

$rawInput = file_get_contents("php://input");

if ($rawInput === false || trim($rawInput) === "") {

    response(
        false,
        "Request body is empty."
    );

}


$data = json_decode(
    $rawInput,
    true
);


if (
    !is_array($data) ||
    json_last_error() !== JSON_ERROR_NONE
) {

    response(
        false,
        "Invalid JSON request."
    );

}


/* ============================================================
   GET REQUEST DATA
============================================================ */

$complaintID =
    $data["complaintID"]
    ?? null;

$action =
    trim(
        (string) (
            $data["action"]
            ?? ""
        )
    );

$details =
    trim(
        (string) (
            $data["details"]
            ?? ""
        )
    );


/* ============================================================
   VALIDATE COMPLAINT ID
============================================================ */

if (
    $complaintID === null ||
    !is_numeric($complaintID)
) {

    response(
        false,
        "Invalid complaint ID."
    );

}


$complaintID =
    (int) $complaintID;


/* ============================================================
   VALIDATE ACTION
============================================================ */

if ($action === "") {

    response(
        false,
        "Log action is required."
    );

}


/* ============================================================
   LIMIT INPUT
============================================================ */

if (mb_strlen($action) > 100) {

    response(
        false,
        "Log action is too long."
    );

}


if (mb_strlen($details) > 1000) {

    response(
        false,
        "Log details are too long."
    );

}


/* ============================================================
   CHECK COMPLAINT EXISTS
============================================================ */

try {

    $checkComplaint = $pdo->prepare(
        "
        SELECT complaintID
        FROM tbl_complaints
        WHERE complaintID = ?
        LIMIT 1
        "
    );


    $checkComplaint->execute([
        $complaintID
    ]);


    if (!$checkComplaint->fetch()) {

        response(
            false,
            "Complaint does not exist."
        );

    }


}
catch (PDOException $e) {

    error_log(
        "Dispatch log complaint check error: " .
        $e->getMessage()
    );

    response(
        false,
        "Unable to verify complaint."
    );

}


/* ============================================================
   INSERT DISPATCH LOG
============================================================ */

try {

    $sql = "
        INSERT INTO tbl_dispatchlogs
        (
            complaintID,
            systemUsersID,
            action,
            details,
            createdAt
        )
        VALUES
        (
            :complaintID,
            :systemUsersID,
            :action,
            :details,
            NOW()
        )
    ";


    $stmt = $pdo->prepare($sql);


    $stmt->execute([
        ":complaintID"  => $complaintID,
        ":systemUsersID" => (int) $systemUserID,
        ":action"       => $action,
        ":details"      => $details !== ""
            ? $details
            : null
    ]);


    response(
        true,
        "Dispatch log created successfully.",
        [
            "logID" =>
                (int) $pdo->lastInsertId()
        ]
    );


}
catch (PDOException $e) {

    error_log(
        "Dispatch log insert error: " .
        $e->getMessage()
    );


    response(
        false,
        "Unable to create dispatch log."
    );

}

?>
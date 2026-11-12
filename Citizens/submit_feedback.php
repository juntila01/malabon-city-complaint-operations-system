<?php

header("Content-Type: application/json");

session_start();

require_once "../db.php";
require_once "../Reports/log_operation.php";


function respond($data, $statusCode = 200)
{
    http_response_code($statusCode);

    echo json_encode($data);

    exit;
}


// ==========================================
// CHECK CITIZEN LOGIN
// ==========================================

if (
    !isset($_SESSION['logged_in']) ||
    $_SESSION['logged_in'] !== true ||
    !isset($_SESSION['user_type']) ||
    $_SESSION['user_type'] !== 'citizen' ||
    !isset($_SESSION['user_id'])
) {

    respond([
        "success" => false,
        "message" => "User is not logged in."
    ], 401);

}


// ==========================================
// GET LOGGED-IN CITIZEN ID
// ==========================================

$citizenID = (int) $_SESSION['user_id'];


// ==========================================
// GET POST DATA
// ==========================================

$complaintID = isset($_POST['complaintID'])
    ? (int) $_POST['complaintID']
    : 0;

$rating = isset($_POST['rating'])
    ? (int) $_POST['rating']
    : 0;

$comments = trim(
    $_POST['comment'] ?? ''
);


// ==========================================
// VALIDATE COMPLAINT ID
// ==========================================

if ($complaintID <= 0) {

    respond([
        "success" => false,
        "message" => "Invalid complaint ID."
    ], 400);

}


// ==========================================
// VALIDATE RATING
// ==========================================

if ($rating < 1 || $rating > 5) {

    respond([
        "success" => false,
        "message" => "Please select a rating from 1 to 5 stars."
    ], 400);

}


// ==========================================
// VALIDATE COMMENT
// ==========================================

if (strlen($comments) > 1000) {

    respond([
        "success" => false,
        "message" => "Comments cannot exceed 1000 characters."
    ], 400);

}


try {

    // ==========================================
    // VERIFY COMPLAINT BELONGS TO CITIZEN
    // ==========================================

    $stmt = $pdo->prepare("

        SELECT
            complaintID,
            citizenID,
            status

        FROM tbl_complaints

        WHERE complaintID = :complaintID
        AND citizenID = :citizenID

        LIMIT 1

    ");


    $stmt->execute([
        ":complaintID" => $complaintID,
        ":citizenID" => $citizenID
    ]);


    $complaint =
        $stmt->fetch(PDO::FETCH_ASSOC);


    // ==========================================
    // COMPLAINT NOT FOUND
    // ==========================================

    if (!$complaint) {

        respond([
            "success" => false,
            "message" => "Complaint not found."
        ], 404);

    }


    // ==========================================
    // CHECK COMPLAINT STATUS
    // ==========================================

    if (
        $complaint["status"] !== "Completed" &&
        $complaint["status"] !== "Resolved"
    ) {

        respond([
            "success" => false,
            "message" =>
                "Feedback can only be submitted for completed complaints."
        ], 400);

    }


    // ==========================================
    // CHECK EXISTING FEEDBACK
    // ==========================================

    $stmt = $pdo->prepare("

        SELECT feedbackID

        FROM tbl_feedback

        WHERE complaintID = :complaintID

        LIMIT 1

    ");


    $stmt->execute([
        ":complaintID" => $complaintID
    ]);


    $existingFeedback =
        $stmt->fetch(PDO::FETCH_ASSOC);


    if ($existingFeedback) {

        respond([
            "success" => false,
            "message" =>
                "Feedback has already been submitted for this complaint."
        ], 409);

    }


    // ==========================================
    // INSERT FEEDBACK
    // ==========================================

    $stmt = $pdo->prepare("

        INSERT INTO tbl_feedback
        (
            complaintID,
            rating,
            comments
        )

        VALUES
        (
            :complaintID,
            :rating,
            :comments
        )

    ");


    $stmt->execute([

        ":complaintID" => $complaintID,

        ":rating" => $rating,

        ":comments" =>
            $comments !== ""
                ? $comments
                : null

    ]);


    // ==========================================
    // GET NEW FEEDBACK ID
    // ==========================================

    $feedbackID =
        $pdo->lastInsertId();

    logOperation(
        $pdo,
        "citizen",
        $citizenID,
        $_SESSION['user_email'] ?? "Unknown Citizen",
        "Feedback Submitted",
        "Citizen submitted feedback for complaint #{$complaintID}. Rating: {$rating}/5.",
        $complaintID,
        null,
        "Rating: {$rating}/5"
    );


    // ==========================================
    // SUCCESS
    // ==========================================

    respond([

        "success" => true,

        "message" =>
            "Feedback submitted successfully.",

        "feedbackID" =>
            (int) $feedbackID

    ]);


}

catch (PDOException $e) {

    error_log(
        "submit_feedback.php: " .
        $e->getMessage()
    );


    // Handle duplicate complaintID
    // in case the UNIQUE constraint catches
    // a simultaneous second submission.

    if ($e->getCode() === "23000") {

        respond([
            "success" => false,
            "message" =>
                "Feedback has already been submitted for this complaint."
        ], 409);

    }


    respond([

        "success" => false,

        "message" =>
            "Database error while submitting feedback."

    ], 500);

}
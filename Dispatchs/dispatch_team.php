<?php

session_start();

header("Content-Type: application/json");

require_once "../db.php";
require_once "../Reports/log_operation.php";
require_once "../Cores/send_citizen_notification.php";


// ============================================================
// CHECK LOGIN
// ============================================================

if (
    !isset($_SESSION['logged_in']) ||
    $_SESSION['logged_in'] !== true
) {
    http_response_code(401);

    echo json_encode([
        "success" => false,
        "message" => "You are not logged in."
    ]);

    exit;
}


// ============================================================
// CHECK SYSTEM USER
// ============================================================

if (
    !isset($_SESSION['user_type']) ||
    $_SESSION['user_type'] !== 'system'
) {
    http_response_code(403);

    echo json_encode([
        "success" => false,
        "message" => "Only system users can dispatch complaints."
    ]);

    exit;
}


// ============================================================
// CHECK USER ID
// ============================================================

if (!isset($_SESSION['user_id'])) {
    http_response_code(403);

    echo json_encode([
        "success" => false,
        "message" => "System user ID not found in session."
    ]);

    exit;
}

$systemUsersID = (int) $_SESSION['user_id'];


// ============================================================
// CHECK USER ROLE
// ============================================================

$userRole = strtolower(
    trim($_SESSION['user_role'] ?? '')
);

if (
    $userRole !== 'admin' &&
    $userRole !== 'staff'
) {
    http_response_code(403);

    echo json_encode([
        "success" => false,
        "message" => "Only admin and staff users can dispatch complaints."
    ]);

    exit;
}


// ============================================================
// GET USER DEPARTMENT
// ============================================================

$userDepartment = strtoupper(
    trim($_SESSION['department'] ?? '')
);


// ============================================================
// VALIDATE USER DEPARTMENT
// ============================================================

$allowedDepartments = [
    'IT',
    'BFP',
    'MCAT',
    'PSTMO'
];

if (
    !in_array($userDepartment, $allowedDepartments, true)
) {
    http_response_code(403);

    echo json_encode([
        "success" => false,
        "message" => "Your department is not authorized to dispatch complaints."
    ]);

    exit;
}


// ============================================================
// READ REQUEST
// ============================================================

$data = json_decode(
    file_get_contents("php://input"),
    true
);

$complaintID = isset($data["complaintID"])
    ? (int) $data["complaintID"]
    : 0;

$teamID = isset($data["teamID"])
    ? (int) $data["teamID"]
    : 0;


// ============================================================
// VALIDATE REQUEST
// ============================================================

if (
    $complaintID <= 0 ||
    $teamID <= 0
) {
    echo json_encode([
        "success" => false,
        "message" => "Missing complaint or team."
    ]);

    exit;
}


// ============================================================
// EMAIL RESULT DEFAULTS
// ============================================================

$emailSentCount = 0;
$emailFailedCount = 0;
$totalEmails = 0;

$notifications = [];

$citizenEmail = null;
$citizenName = "Citizen";
$complaintReference = null;


try {

    // ========================================================
    // START TRANSACTION
    // ========================================================

    $pdo->beginTransaction();


    // ========================================================
    // GET COMPLAINT AND CITIZEN INFORMATION
    // ========================================================
    //
    // The citizen's name, email, and complaint reference
    // are needed for email notifications.
    //
    // ========================================================

    $stmt = $pdo->prepare("
        SELECT
            c.complaintID,
            c.citizenID,
            c.complaintReference,
            c.status,
            c.aiAnalysisStatus,
            c.dispatchTeamID,
            c.dispatchStatus,
            u.fullName,
            u.email,
            a.category,
            a.urgency
        FROM tbl_complaints c

        LEFT JOIN tbl_citizens u
            ON u.citizenID = c.citizenID

        LEFT JOIN tbl_ai_analysis a
            ON a.complaintID = c.complaintID

        WHERE c.complaintID = ?

        FOR UPDATE
    ");

    $stmt->execute([
        $complaintID
    ]);

    $complaint = $stmt->fetch(PDO::FETCH_ASSOC);


    // ========================================================
    // COMPLAINT NOT FOUND
    // ========================================================

    if (!$complaint) {
        throw new Exception("Complaint not found.");
    }
    
    // ========================================================
    // REQUIRE COMPLETED AI ANALYSIS OR MANUAL REVIEW
    // ========================================================

    $aiAnalysisStatus = strtolower(
        trim((string) ($complaint["aiAnalysisStatus"] ?? ""))
    );

    if ($aiAnalysisStatus !== "completed") {
        throw new Exception(
            "Dispatch blocked: complaint analysis is not completed. " .
            "Complete the AI analysis or required manual review first."
        );
    }



    // ========================================================
    // GET CITIZEN EMAIL DETAILS
    // ========================================================

    $citizenID = (int) $complaint["citizenID"];

    $citizenName = trim(
        $complaint["fullName"] ?? ''
    );

    if ($citizenName === '') {
        $citizenName = "Citizen";
    }

    $citizenEmail = trim(
        $complaint["email"] ?? ''
    );

    $complaintReference = trim(
        $complaint["complaintReference"] ?? ''
    );

    if ($complaintReference === '') {
        $complaintReference = null;
    }


    // ========================================================
    // GET CATEGORY AND URGENCY
    // ========================================================

    $category = strtoupper(
        trim($complaint["category"] ?? '')
    );

    $urgency = strtoupper(
        trim($complaint["urgency"] ?? '')
    );


    // ========================================================
    // VALIDATE AI DATA
    // ========================================================

    
    if (!in_array(
        $category,
        ["FIRE", "FLOOD", "OBSTRUCTION", "TRAFFIC"],
        true
    )) {
        throw new Exception(
            "Complaint category is missing or invalid. " .
            "Complete the complaint review before dispatch."
        );
    }

    if (!in_array(
        $urgency,
        ["HIGH", "NORMAL"],
        true
    )) {
        throw new Exception(
            "Complaint urgency is missing or invalid. " .
            "Complete the complaint review before dispatch."
        );
    }



    // ========================================================
    // DETERMINE RESPONSIBLE DEPARTMENT
    // ========================================================

    $complaintDepartment = null;


    // --------------------------------------------------------
    // FIRE
    // --------------------------------------------------------

    if ($category === 'FIRE') {

        $complaintDepartment = 'BFP';

    }


    // --------------------------------------------------------
    // FLOOD
    // --------------------------------------------------------

    elseif ($category === 'FLOOD') {

        if ($urgency === 'HIGH') {

            $complaintDepartment = 'BFP';

        } elseif ($urgency === 'NORMAL') {

            $complaintDepartment = 'MCAT';

        }

    }


    // --------------------------------------------------------
    // OBSTRUCTION
    // --------------------------------------------------------

    elseif ($category === 'OBSTRUCTION') {

        $complaintDepartment = 'MCAT';

    }


    // --------------------------------------------------------
    // TRAFFIC
    // --------------------------------------------------------

    elseif ($category === 'TRAFFIC') {

        $complaintDepartment = 'PSTMO';

    }


    // ========================================================
    // INVALID CATEGORY / URGENCY
    // ========================================================

    if ($complaintDepartment === null) {
        throw new Exception(
            "Complaint does not have a valid department assignment."
        );
    }


    // ========================================================
    // CHECK USER DEPARTMENT ACCESS
    // ========================================================

    if (
        $userDepartment !== 'IT' &&
        $userDepartment !== $complaintDepartment
    ) {
        throw new Exception(
            "You are not authorized to dispatch this complaint."
        );
    }


    // ========================================================
    // CHECK COMPLAINT STATUS
    // ========================================================

    if ($complaint["status"] !== "Verified") {
        throw new Exception(
            "Only verified complaints can be dispatched."
        );
    }


    // ========================================================
    // CHECK IF ALREADY ASSIGNED
    // ========================================================

    if (!empty($complaint["dispatchTeamID"])) {
        throw new Exception(
            "This complaint has already been assigned to a dispatch team."
        );
    }


    // ========================================================
    // GET DISPATCH TEAM
    // ========================================================

    $stmt = $pdo->prepare("
        SELECT
            teamID,
            teamName,
            department,
            teamLeader,
            contactNumber,
            status,
            currentComplaintID
        FROM tbl_dispatch_teams
        WHERE teamID = ?
        FOR UPDATE
    ");

    $stmt->execute([
        $teamID
    ]);

    $team = $stmt->fetch(PDO::FETCH_ASSOC);


    // ========================================================
    // TEAM NOT FOUND
    // ========================================================

    if (!$team) {
        throw new Exception(
            "Dispatch team not found."
        );
    }


    $teamDepartment = strtoupper(
        trim($team["department"] ?? '')
    );


    // ========================================================
    // VALIDATE TEAM DEPARTMENT
    // ========================================================

    if ($teamDepartment === '') {
        throw new Exception(
            "Dispatch team department is not assigned."
        );
    }


    // ========================================================
    // CHECK TEAM RESPONSIBLE DEPARTMENT
    // ========================================================

    if ($teamDepartment !== $complaintDepartment) {
        throw new Exception(
            "The selected dispatch team does not handle this complaint."
        );
    }


    // ========================================================
    // CHECK TEAM ACCESS FOR NON-IT USERS
    // ========================================================

    if (
        $userDepartment !== 'IT' &&
        $teamDepartment !== $userDepartment
    ) {
        throw new Exception(
            "You are not authorized to assign this dispatch team."
        );
    }


    // ========================================================
    // CHECK TEAM STATUS
    // ========================================================

    if (
        $team["status"] !== "Available" &&
        $team["status"] !== "Dispatched"
    ) {
        throw new Exception(
            "This dispatch team is not available for dispatch."
        );
    }


    // ========================================================
    // UPDATE DISPATCH TEAM
    // ========================================================

    if ($team["status"] === "Available") {

        // Team is free; make this its current complaint.

        $stmt = $pdo->prepare("
            UPDATE tbl_dispatch_teams
            SET
                status = 'Dispatched',
                currentComplaintID = ?
            WHERE teamID = ?
        ");

        $stmt->execute([
            $complaintID,
            $teamID
        ]);

    } else {

        // Team is already handling another complaint.
        // Keep its currentComplaintID unchanged.

        $stmt = $pdo->prepare("
            UPDATE tbl_dispatch_teams
            SET status = 'Dispatched'
            WHERE teamID = ?
        ");

        $stmt->execute([
            $teamID
        ]);

    }


    // ========================================================
    // UPDATE COMPLAINT
    // ========================================================

    $stmt = $pdo->prepare("
        UPDATE tbl_complaints
        SET
            status = 'In Progress',
            dispatchTeamID = ?,
            dispatchStatus = 'Assigned',
            firstResponseAt = COALESCE(firstResponseAt, NOW())
        WHERE complaintID = ?
    ");

    $stmt->execute([
        $teamID,
        $complaintID
    ]);


    // ========================================================
    // PREPARE CITIZEN NOTIFICATIONS
    // ========================================================

    $notifications = [
        [
            "title" => "Response Team Dispatched",
            "message" => "A response team has been dispatched to your complaint and will respond as soon as possible.",
            "type" => "dispatched"
        ],
        [
            "title" => "Complaint Accepted",
            "message" => "Your complaint has been accepted by a dispatch team and is now being handled.",
            "type" => "dispatched"
        ]
    ];


    // ========================================================
    // INSERT IN-APP CITIZEN NOTIFICATIONS
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
            ?,
            0
        )
    ");

    foreach ($notifications as $notification) {

        $notificationStmt->execute([
            $citizenID,
            $complaintID,
            $notification["title"],
            $notification["message"],
            $notification["type"]
        ]);

    }


    // ========================================================
    // VERIFY UPDATED COMPLAINT
    // ========================================================

    $checkStmt = $pdo->prepare("
        SELECT
            complaintID,
            citizenID,
            status,
            dispatchTeamID,
            dispatchStatus
        FROM tbl_complaints
        WHERE complaintID = ?
    ");

    $checkStmt->execute([
        $complaintID
    ]);

    $updatedComplaint = $checkStmt->fetch(PDO::FETCH_ASSOC);


    if (!$updatedComplaint) {
        throw new Exception(
            "Complaint could not be verified after dispatch."
        );
    }


    if ($updatedComplaint["status"] !== "In Progress") {
        throw new Exception(
            "Complaint status was not updated. Current status: " .
            ($updatedComplaint["status"] ?? "NULL")
        );
    }


    if (
        (int) $updatedComplaint["dispatchTeamID"] !== $teamID
    ) {
        throw new Exception(
            "Dispatch team was not assigned correctly."
        );
    }


    if ($updatedComplaint["dispatchStatus"] !== "Assigned") {
        throw new Exception(
            "Dispatch status was not updated correctly."
        );
    }


    // ========================================================
    // SYSTEM AUDIT LOG
    // ========================================================

    logOperation(
        $pdo,
        "system_user",
        $systemUsersID,
        $_SESSION['user_email'] ?? 'System User',
        "Complaint Dispatched",
        "System user from {$userDepartment} assigned complaint #{$complaintID} ({$category}, {$urgency}) to dispatch team #{$teamID} ({$teamDepartment}).",
        $complaintID,
        $complaint["dispatchTeamID"] ?? null,
        $teamID
    );


    // ========================================================
    // COMMIT TRANSACTION
    // ========================================================
    //
    // Commit first. Email failures must not undo dispatch.
    //
    // ========================================================

    $pdo->commit();


    // ========================================================
    // SEND CITIZEN EMAIL NOTIFICATIONS
    // ========================================================

    $totalEmails = count($notifications);

    if (
        filter_var($citizenEmail, FILTER_VALIDATE_EMAIL)
    ) {

        foreach ($notifications as $notification) {

            try {

                $emailResult = sendCitizenNotificationEmail(
                    $citizenEmail,
                    $citizenName,
                    $notification["title"],
                    $notification["message"],
                    $complaintReference
                );

                // A false return value means the email
                // function reported an unsuccessful send.
                if ($emailResult === false) {

                    $emailFailedCount++;

                    error_log(
                        "Citizen notification email failed for complaint #{$complaintID}: " .
                        $notification["title"]
                    );

                } else {

                    $emailSentCount++;

                }

            } catch (Throwable $emailError) {

                $emailFailedCount++;

                error_log(
                    "Citizen notification email error for complaint #{$complaintID}: " .
                    $emailError->getMessage()
                );

            }

        }

    } else {

        // Missing or invalid email address.

        $emailFailedCount = $totalEmails;

        error_log(
            "Citizen notification emails skipped for complaint #{$complaintID}: invalid or missing citizen email."
        );

    }


    // ========================================================
    // SUCCESS RESPONSE
    // ========================================================

    echo json_encode([
        "success" => true,
        "message" => "Dispatch successful.",
        "emailSent" => $emailSentCount > 0,
        "emailsSentCount" => $emailSentCount,
        "emailsFailedCount" => $emailFailedCount
    ]);

} catch (Throwable $e) {

    // ========================================================
    // ROLLBACK ONLY IF TRANSACTION IS STILL ACTIVE
    // ========================================================

    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }


    // ========================================================
    // LOG ERROR
    // ========================================================

    error_log(
        "Complaint dispatch error for complaint #{$complaintID}: " .
        $e->getMessage()
    );


    // ========================================================
    // ERROR RESPONSE
    // ========================================================

    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);

}
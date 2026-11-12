<?php

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
        "Only system users can update complaints."
    );

}


// ============================================================
// CHECK USER ID
// ============================================================

if (!isset($_SESSION['user_id'])) {

    jsonResponse(
        false,
        "System user ID not found in session."
    );

}

$systemUsersID = (int) $_SESSION['user_id'];

if ($systemUsersID <= 0) {

    jsonResponse(
        false,
        "Invalid system user ID."
    );

}


// ============================================================
// GET USER DEPARTMENT
// ============================================================

$userDepartment = strtoupper(
    trim(
        (string) ($_SESSION['department'] ?? '')
    )
);

if ($userDepartment === '') {

    jsonResponse(
        false,
        "Your department is not assigned."
    );

}


// ============================================================
// GET USER ROLE
// ============================================================

$userRole = strtolower(
    trim(
        (string) ($_SESSION['user_role'] ?? '')
    )
);


// ============================================================
// CHECK USER ROLE
// ============================================================

if (
    !in_array(
        $userRole,
        ['admin', 'staff'],
        true
    )
) {

    jsonResponse(
        false,
        "You are not authorized to update complaints."
    );

}


// ============================================================
// READ REQUEST DATA
// ============================================================

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

$id = filter_var(
    $data["complaintID"] ?? null,
    FILTER_VALIDATE_INT,
    [
        "options" => [
            "min_range" => 1
        ]
    ]
);

$status = trim(
    is_string($data["status"] ?? null)
        ? $data["status"]
        : ''
);


// ============================================================
// VALIDATE INPUT
// ============================================================

if ($id === false || $id === null || $status === '') {

    jsonResponse(
        false,
        "Missing complaint ID or status."
    );

}

$id = (int) $id;


// ============================================================
// ALLOWED STATUS VALUES
// ============================================================

$allowedStatuses = [
    "Pending",
    "Verified",
    "Rejected",
    "Assigned",
    "Dispatched",
    "In Progress",
    "Resolved",
    "Unable to Resolve"
];

if (!in_array($status, $allowedStatuses, true)) {

    jsonResponse(
        false,
        "Invalid complaint status."
    );

}


// ============================================================
// PROCESS STATUS UPDATE
// ============================================================

try {

    $pdo->beginTransaction();


    // ========================================================
    // GET COMPLAINT, AI INFORMATION AND CITIZEN DETAILS
    // ========================================================

    $stmt = $pdo->prepare("
        SELECT
            c.complaintID,
            c.citizenID,
            c.complaintReference,
            c.status,
            c.aiAnalysisStatus,
            c.deadlineAt,
            c.slaStatus,
            u.fullName,
            u.email,
            ai.category,
            ai.urgency
        FROM tbl_complaints c

        INNER JOIN tbl_citizens u
            ON u.citizenID = c.citizenID

        LEFT JOIN tbl_ai_analysis ai
            ON ai.complaintID = c.complaintID

        WHERE c.complaintID = ?

        FOR UPDATE
    ");

    $stmt->execute([
        $id
    ]);

    $complaint = $stmt->fetch(PDO::FETCH_ASSOC);


    // ========================================================
    // COMPLAINT NOT FOUND
    // ========================================================

    if (!$complaint) {

        throw new Exception(
            "Complaint or associated citizen account not found."
        );

    }


    // ========================================================
    // EXTRACT COMPLAINT AND CITIZEN INFORMATION
    // ========================================================

    $oldStatus = (string) $complaint["status"];

    $citizenID = (int) $complaint["citizenID"];

    $citizenName = (string) ($complaint["fullName"] ?? '');

    $citizenEmail = trim(
        (string) ($complaint["email"] ?? '')
    );

    $complaintReference = trim(
        (string) ($complaint["complaintReference"] ?? '')
    );
    // ========================================================
    // CHECK AI ANALYSIS STATUS
    // ========================================================

    $aiAnalysisStatus = strtolower(
        trim(
            (string) ($complaint["aiAnalysisStatus"] ?? '')
        )
    );

    $requiresManualReview =
        $aiAnalysisStatus === 'unavailable';

    // ========================================================
    // BLOCK VERIFICATION UNTIL MANUAL REVIEW IS COMPLETED
    // ========================================================

    if (
        $requiresManualReview &&
        $status === 'Verified'
    ) {
        throw new Exception(
            "This complaint requires manual review before verification. " .
            "Its category, urgency, and response deadline must be " .
            "reviewed and saved first."
        );
    }

    // ========================================================
    // CHECK AI INFORMATION
    // ========================================================

    $category = strtoupper(
        trim(
            (string) ($complaint["category"] ?? '')
        )
    );

    $urgency = strtoupper(
        trim(
            (string) ($complaint["urgency"] ?? '')
        )
    );

    if ($category === '') {

        throw new Exception(
            "Complaint AI category is not available."
        );

    }

    if ($urgency === '') {

        throw new Exception(
            "Complaint urgency is not available."
        );

    }


    // ========================================================
    // DETERMINE RESPONSIBLE DEPARTMENT
    // ========================================================

    $complaintDepartment = null;

    if ($category === 'FIRE') {

        $complaintDepartment = 'BFP';

    } elseif ($category === 'FLOOD') {

        if ($urgency === 'HIGH') {

            $complaintDepartment = 'BFP';

        } elseif ($urgency === 'NORMAL') {

            $complaintDepartment = 'MCAT';

        }

    } elseif ($category === 'OBSTRUCTION') {

        $complaintDepartment = 'MCAT';

    } elseif ($category === 'TRAFFIC') {

        $complaintDepartment = 'PSTMO';

    }


    // ========================================================
    // UNKNOWN CATEGORY / INVALID AI DATA
    // ========================================================

    if ($complaintDepartment === null) {

        throw new Exception(
            "Complaint does not have a valid department assignment."
        );

    }


    // ========================================================
    // DEPARTMENT ACCESS CONTROL
    // ========================================================

    if (
        $userDepartment !== 'IT' &&
        $userDepartment !== $complaintDepartment
    ) {

        throw new Exception(
            "You are not authorized to update this complaint."
        );

    }


    // ========================================================
    // PREVENT CHANGING A REJECTED COMPLAINT
    // ========================================================

    if (
        $oldStatus === "Rejected" &&
        $status !== "Rejected"
    ) {

        throw new Exception(
            "Rejected complaints cannot be updated."
        );

    }


    // ========================================================
    // UPDATE COMPLAINT STATUS
    // ========================================================

    $stmt = $pdo->prepare("
        UPDATE tbl_complaints
        SET
            status = ?,
            assignedStaffID = ?
        WHERE complaintID = ?
    ");

    $stmt->execute([
        $status,
        $systemUsersID,
        $id
    ]);


    // ========================================================
    // PREPARE CITIZEN NOTIFICATION
    // ========================================================

    $notificationTitle = null;
    $notificationMessage = null;
    $notificationCreated = false;
    $emailSent = false;

    if ($oldStatus !== $status) {

        switch ($status) {

            case "Verified":

                $notificationTitle = "Complaint Verified";

                $notificationMessage =
                    "Your complaint has been verified by the administration " .
                    "and is now being processed.";

                break;


            case "Rejected":

                $notificationTitle = "Complaint Rejected";

                $notificationMessage =
                    "Your complaint has been rejected by the administration. " .
                    "Please check your complaint details or contact the " .
                    "appropriate department for further assistance.";

                break;


            case "Resolved":

                $notificationTitle = "Complaint Resolved";

                $notificationMessage =
                    "Your complaint has been resolved successfully. " .
                    "Thank you for using the Malabon City Action Team " .
                    "complaint system.";

                break;


            case "Unable to Resolve":

                $notificationTitle = "Complaint Unable to Resolve";

                $notificationMessage =
                    "Your complaint could not be resolved by the assigned team. " .
                    "Please check your complaint details or contact the " .
                    "appropriate department for further assistance.";

                break;

        }


        // ====================================================
        // CHECK FOR EXISTING NOTIFICATION
        // ====================================================

        if (
            $notificationTitle !== null &&
            $notificationMessage !== null
        ) {

            $checkNotificationStmt = $pdo->prepare("
                SELECT notificationID
                FROM tbl_notifications
                WHERE citizenID = ?
                  AND complaintID = ?
                  AND title = ?
                LIMIT 1
            ");

            $checkNotificationStmt->execute([
                $citizenID,
                $id,
                $notificationTitle
            ]);

            $existingNotification =
                $checkNotificationStmt->fetchColumn();


            // =================================================
            // CREATE NOTIFICATION ONLY IF IT DOES NOT EXIST
            // =================================================

            if (!$existingNotification) {

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

                $notificationStmt->execute([
                    $citizenID,
                    $id,
                    $notificationTitle,
                    $notificationMessage,
                    "complaint"
                ]);

                $notificationCreated = true;

            }

        }

    }


    // ========================================================
    // OPERATIONAL LOG
    // ========================================================

    logOperation(
        $pdo,
        'system_user',
        $systemUsersID,
        $_SESSION['user_email'] ?? 'System User',
        'Update Complaint Status',
        "System user changed complaint #{$id} status from '{$oldStatus}' to '{$status}'. Department: {$userDepartment}. Role: {$userRole}.",
        $id,
        $oldStatus,
        $status
    );


    // ========================================================
    // COMMIT DATABASE CHANGES
    // ========================================================

    $pdo->commit();


    // ========================================================
    // SEND CITIZEN EMAIL AFTER COMMIT
    // ========================================================

    if (
        $notificationCreated &&
        $notificationTitle !== null &&
        $notificationMessage !== null
    ) {

        if (
            filter_var(
                $citizenEmail,
                FILTER_VALIDATE_EMAIL
            )
        ) {

            try {

                $emailSent = sendCitizenNotificationEmail(
                    $citizenEmail,
                    $citizenName,
                    $notificationTitle,
                    $notificationMessage,
                    $complaintReference !== ''
                        ? $complaintReference
                        : null
                );

                if (!$emailSent) {

                    error_log(
                        "Could not send citizen complaint status email. " .
                        "Complaint ID: " . $id .
                        " | Status: " . $status
                    );

                }

            } catch (Throwable $emailException) {

                $emailSent = false;

                error_log(
                    "Citizen status email exception. " .
                    "Complaint ID: " . $id .
                    " | Status: " . $status .
                    " | Error: " . $emailException->getMessage()
                );

            }

        } else {

            error_log(
                "Citizen has no valid email for complaint status notification. " .
                "Complaint ID: " . $id .
                " | Status: " . $status
            );

        }

    }


    // ========================================================
    // SUCCESS RESPONSE
    // ========================================================

    jsonResponse(
        true,
        "Complaint status updated successfully.",
        [
            "status" => $status,
            "department" => $userDepartment,
            "role" => $userRole,
            "notificationCreated" => $notificationCreated,
            "emailSent" => $emailSent
        ]
    );


} catch (Throwable $e) {

    // ========================================================
    // ROLLBACK ONLY IF TRANSACTION IS STILL ACTIVE
    // ========================================================

    if ($pdo->inTransaction()) {

        $pdo->rollBack();

    }


    error_log(
        "UPDATE COMPLAINT STATUS ERROR: " .
        $e->getMessage()
    );


    // ========================================================
    // ERROR RESPONSE
    // ========================================================

    $httpStatus = 400;

    if (
        stripos($e->getMessage(), 'not found') !== false
    ) {

        $httpStatus = 404;

    }

    http_response_code($httpStatus);

    jsonResponse(
        false,
        $e->getMessage()
    );

}

?>

<?php

session_start();

header("Content-Type: application/json; charset=utf-8");

date_default_timezone_set("Asia/Manila");

require_once "../db.php";
require_once "../Reports/log_operation.php";


// ============================================================
// RESPONSE HELPER
// ============================================================

function jsonResponse(
    bool $success,
    string $message,
    array $data = [],
    int $httpStatus = 200
): void {

    http_response_code($httpStatus);

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
// CHECK LOGIN
// ============================================================

if (
    !isset($_SESSION["logged_in"]) ||
    $_SESSION["logged_in"] !== true
) {
    jsonResponse(
        false,
        "You are not logged in.",
        [],
        401
    );
}


// ============================================================
// CHECK SYSTEM USER
// ============================================================

if (
    ($_SESSION["user_type"] ?? "") !== "system"
) {
    jsonResponse(
        false,
        "Only system users can perform manual review.",
        [],
        403
    );
}


// ============================================================
// CHECK USER ROLE AND ID
// ============================================================

$userRole = strtolower(
    trim((string) ($_SESSION["user_role"] ?? ""))
);

$userDepartment = strtoupper(
    trim((string) ($_SESSION["department"] ?? ""))
);

$systemUsersID = filter_var(
    $_SESSION["user_id"] ?? null,
    FILTER_VALIDATE_INT,
    [
        "options" => [
            "min_range" => 1
        ]
    ]
);

if (
    $systemUsersID === false ||
    $systemUsersID === null
) {
    jsonResponse(
        false,
        "Invalid system user ID.",
        [],
        401
    );
}


// ============================================================
// MANUAL REVIEW PERMISSION
// ============================================================

// Administrators can review complaints regardless of department.
// IT staff can also perform manual classification.
// Department-specific staff cannot classify an unassigned complaint.

if (
    !in_array($userRole, ["admin", "staff"], true) ||
    (
        $userRole !== "admin" &&
        $userDepartment !== "IT"
    )
) {
    jsonResponse(
        false,
        "You are not authorized to perform manual complaint review.",
        [],
        403
    );
}


// ============================================================
// READ REQUEST
// ============================================================

$data = json_decode(
    file_get_contents("php://input"),
    true
);

if (!is_array($data)) {
    jsonResponse(
        false,
        "Invalid request data.",
        [],
        400
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

$category = strtoupper(
    trim(
        is_string($data["category"] ?? null)
            ? $data["category"]
            : ""
    )
);

$urgency = strtoupper(
    trim(
        is_string($data["urgency"] ?? null)
            ? $data["urgency"]
            : ""
    )
);


// ============================================================
// VALIDATE INPUT
// ============================================================

if (
    $id === false ||
    $id === null ||
    !in_array(
        $category,
        ["FIRE", "FLOOD", "OBSTRUCTION", "TRAFFIC"],
        true
    ) ||
    !in_array(
        $urgency,
        ["HIGH", "NORMAL"],
        true
    )
) {
    jsonResponse(
        false,
        "Select a valid complaint category and urgency.",
        [],
        400
    );
}

$id = (int) $id;


// ============================================================
// SAVE MANUAL REVIEW
// ============================================================

try {

    $pdo->beginTransaction();


    // ========================================================
    // LOCK COMPLAINT
    // ========================================================

    $stmt = $pdo->prepare("
        SELECT
            complaintID,
            complaintReference,
            status,
            createdAt,
            aiAnalysisStatus,
            dispatchTeamID,
            dispatchStatus
        FROM tbl_complaints
        WHERE complaintID = ?
        FOR UPDATE
    ");

    $stmt->execute([$id]);

    $complaint = $stmt->fetch(PDO::FETCH_ASSOC);


    if (!$complaint) {
        throw new RuntimeException(
            "Complaint not found.",
            404
        );
    }


    // ========================================================
    // ENSURE MANUAL REVIEW IS REQUIRED
    // ========================================================

    if (
        strtolower(
            trim(
                (string) $complaint["aiAnalysisStatus"]
            )
        ) !== "unavailable"
    ) {
        throw new RuntimeException(
            "This complaint does not require manual AI review.",
            409
        );
    }


    // ========================================================
    // CHECK COMPLAINT STATUS
    // ========================================================

    if ($complaint["status"] !== "Pending") {
        throw new RuntimeException(
            "Only pending complaints can receive manual review.",
            409
        );
    }


    // ========================================================
    // PREVENT REVIEW AFTER DISPATCH HAS STARTED
    // ========================================================

    if (
        !empty($complaint["dispatchTeamID"]) ||
        !empty($complaint["dispatchStatus"])
    ) {
        throw new RuntimeException(
            "This complaint already has dispatch information. " .
            "Review its current status before proceeding.",
            409
        );
    }


    // ========================================================
    // CALCULATE RESPONSE DEADLINE
    // HIGH = 24 HOURS
    // NORMAL = 72 HOURS
    // ========================================================

    $responseHours = $urgency === "HIGH" ? 24 : 72;

    $createdAt = new DateTime(
        $complaint["createdAt"],
        new DateTimeZone("Asia/Manila")
    );

    $deadline = clone $createdAt;

    $deadline->modify(
        "+" . $responseHours . " hours"
    );

    $deadlineAt = $deadline->format("Y-m-d H:i:s");


    // ========================================================
    // CHECK EXISTING ANALYSIS
    // ========================================================

    $analysisStmt = $pdo->prepare("
        SELECT analysisID
        FROM tbl_ai_analysis
        WHERE complaintID = ?
        FOR UPDATE
    ");

    $analysisStmt->execute([$id]);

    $analysisID = $analysisStmt->fetchColumn();


    // ========================================================
    // INSERT OR UPDATE CLASSIFICATION
    // ========================================================

    if ($analysisID) {

        $stmt = $pdo->prepare("
            UPDATE tbl_ai_analysis
            SET
                category = ?,
                urgency = ?,
                confidence = 0.0000,
                analyzedAt = NOW()
            WHERE complaintID = ?
        ");

        $stmt->execute([
            $category,
            $urgency,
            $id
        ]);

    } else {

        $stmt = $pdo->prepare("
            INSERT INTO tbl_ai_analysis
            (
                complaintID,
                category,
                urgency,
                confidence,
                containsProfanity,
                imageMatch,
                analyzedAt
            )
            VALUES (?, ?, ?, 0.0000, 0, 'INCONCLUSIVE', NOW())
        ");

        $stmt->execute([
            $id,
            $category,
            $urgency
        ]);

    }


    // ========================================================
    // MARK REVIEW COMPLETED AND SET DEADLINE
    // ========================================================

    $stmt = $pdo->prepare("
        UPDATE tbl_complaints
        SET
            aiAnalysisStatus = 'Completed',
            deadlineAt = ?,
            slaStatus = 'On Time'
        WHERE complaintID = ?
          AND aiAnalysisStatus = 'Unavailable'
          AND status = 'Pending'
    ");

    $stmt->execute([
        $deadlineAt,
        $id
    ]);

    if ($stmt->rowCount() !== 1) {
        throw new RuntimeException(
            "The complaint could not be updated. Refresh and try again.",
            409
        );
    }


    // ========================================================
    // RECORD ACTIVITY LOG
    // ========================================================

    logOperation(
        $pdo,
        "system_user",
        (int) $systemUsersID,
        $_SESSION["user_email"] ?? "System User",
        "Manual Complaint Review",
        "System user manually classified complaint #{$id}. " .
        "Category: {$category}. Urgency: {$urgency}. " .
        "Response deadline: {$deadlineAt}. " .
        "Department: {$userDepartment}. Role: {$userRole}.",
        $id,
        "AI Analysis Unavailable",
        "Manual Review Completed"
    );


    // ========================================================
    // COMMIT
    // ========================================================

    $pdo->commit();


    // ========================================================
    // SUCCESS
    // ========================================================

    jsonResponse(
        true,
        "Manual review saved successfully.",
        [
            "complaintID" => $id,
            "category" => $category,
            "urgency" => $urgency,
            "deadlineAt" => $deadlineAt,
            "responseHours" => $responseHours,
            "aiAnalysisStatus" => "Completed"
        ]
    );


} catch (Throwable $e) {

    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    error_log(
        "SAVE MANUAL REVIEW ERROR: " .
        $e->getMessage()
    );

    $httpStatus = $e instanceof RuntimeException
        && in_array((int) $e->getCode(), [404, 409], true)
            ? (int) $e->getCode()
            : 500;

    jsonResponse(
        false,
        $httpStatus === 500
            ? "An error occurred while saving manual review."
            : $e->getMessage(),
        [],
        $httpStatus
    );
}

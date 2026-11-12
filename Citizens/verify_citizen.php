<?php

header("Content-Type: application/json");

session_start();

require_once "../db.php";
require_once "../Reports/log_operation.php";


try {

    // =========================================================
    // CHECK SYSTEM USER LOGIN
    // =========================================================

    if (
        !isset($_SESSION['logged_in']) ||
        $_SESSION['logged_in'] !== true ||
        !isset($_SESSION['user_id'])
    ) {

        http_response_code(401);

        echo json_encode([
            "success" => false,
            "message" => "Unauthorized access."
        ]);

        exit;
    }


    // =========================================================
    // CHECK ADMIN PERMISSION
    // =========================================================

    $userRole = strtolower(
        trim($_SESSION['user_role'] ?? '')
    );

    if ($userRole !== 'admin') {

        http_response_code(403);

        echo json_encode([
            "success" => false,
            "message" => "You do not have permission to verify citizens."
        ]);

        exit;
    }


    // =========================================================
    // GET REQUEST DATA
    // =========================================================

    $data = json_decode(
        file_get_contents("php://input"),
        true
    );

    $id = isset($data["id"])
        ? (int) $data["id"]
        : 0;


    if ($id <= 0) {

        http_response_code(400);

        echo json_encode([
            "success" => false,
            "message" => "Invalid citizen ID."
        ]);

        exit;
    }


    // =========================================================
    // GET CITIZEN BEFORE UPDATE
    // =========================================================

    $stmt = $pdo->prepare("
        SELECT
            citizenID,
            fullName,
            email,
            verificationStatus
        FROM tbl_citizens
        WHERE citizenID = ?
        LIMIT 1
    ");

    $stmt->execute([$id]);

    $citizen = $stmt->fetch(PDO::FETCH_ASSOC);


    if (!$citizen) {

        http_response_code(404);

        echo json_encode([
            "success" => false,
            "message" => "Citizen not found."
        ]);

        exit;
    }


    $oldStatus = $citizen['verificationStatus'];


    // =========================================================
    // UPDATE VERIFICATION STATUS
    // =========================================================

    $stmt = $pdo->prepare("
        UPDATE tbl_citizens
        SET verificationStatus = 'Verified'
        WHERE citizenID = ?
    ");

    $stmt->execute([$id]);


    // =========================================================
    // GET ACTOR INFORMATION
    // =========================================================

    $actorID = (int) $_SESSION['user_id'];

    $actorName = $_SESSION['user_email'] ?? "Unknown User";

    $actorType = $_SESSION['user_type'] ?? "system_user";


    // =========================================================
    // LOG VERIFICATION APPROVAL
    // =========================================================

    logOperation(
        $pdo,
        $actorType,
        $actorID,
        $actorName,
        "Verification Approved",
        "Citizen #{$citizen['citizenID']} ({$citizen['fullName']}) verification was approved.",
        null,
        $oldStatus,
        "Verified"
    );


    // =========================================================
    // SUCCESS
    // =========================================================

    echo json_encode([
        "success" => true,
        "message" => "Citizen verification approved successfully."
    ]);

} catch (PDOException $e) {

    error_log(
        "verify_citizen.php: " .
        $e->getMessage()
    );

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Database error."
    ]);

} catch (Throwable $e) {

    error_log(
        "verify_citizen.php: " .
        $e->getMessage()
    );

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Server error."
    ]);
}

?>
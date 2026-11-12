<?php

session_start();

header("Content-Type: application/json");

require_once "../db.php";


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
        "message" => "Only system users can access dispatch teams."
    ]);

    exit;
}


// ============================================================
// CHECK USER ROLE
// ============================================================
//
// Both ADMIN and STAFF are allowed to view available
// dispatch teams.
//
// This does NOT give staff permission to add, edit,
// or delete dispatch teams.
//

$userRole = strtolower(
    trim(
        $_SESSION['user_role'] ?? ''
    )
);

if (
    $userRole !== 'admin' &&
    $userRole !== 'staff'
) {

    http_response_code(403);

    echo json_encode([
        "success" => false,
        "message" => "Only admin and staff users can access dispatch teams."
    ]);

    exit;
}


// ============================================================
// GET DEPARTMENT
// ============================================================

$userDepartment = strtoupper(
    trim(
        $_SESSION['department'] ?? ''
    )
);


// ============================================================
// VALIDATE DEPARTMENT
// ============================================================

$allowedDepartments = [
    'IT',
    'BFP',
    'MCAT',
    'PSTMO'
];

if (
    !in_array(
        $userDepartment,
        $allowedDepartments,
        true
    )
) {

    http_response_code(403);

    echo json_encode([
        "success" => false,
        "message" => "Your department is not authorized to access dispatch teams."
    ]);

    exit;
}


try {

    // ========================================================
    // IT CAN SEE ALL TEAMS
    // ========================================================

    if ($userDepartment === 'IT') {

        $stmt = $pdo->prepare("
            SELECT
                teamID,
                teamName,
                department,
                teamLeader,
                contactNumber,
                status
            FROM tbl_dispatch_teams
            WHERE
                status IN ('Available', 'Dispatched')
            ORDER BY
                teamName ASC
        ");

        $stmt->execute();

    }


    // ========================================================
    // OTHER DEPARTMENTS ONLY SEE THEIR OWN TEAMS
    // ========================================================

    else {

        $stmt = $pdo->prepare("
            SELECT
                teamID,
                teamName,
                department,
                teamLeader,
                contactNumber,
                status
            FROM tbl_dispatch_teams
            WHERE
                status IN ('Available', 'Dispatched')
                AND UPPER(TRIM(department)) = ?
            ORDER BY
                teamName ASC
        ");

        $stmt->execute([
            $userDepartment
        ]);

    }


    // ========================================================
    // RETURN ARRAY DIRECTLY
    // ========================================================
    //
    // Keep this response format because complaint.js
    // already expects the returned value to be an array.
    //
    // ========================================================

    echo json_encode(
        $stmt->fetchAll(PDO::FETCH_ASSOC)
    );

}
catch (PDOException $e) {

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Database error while loading dispatch teams."
    ]);

}
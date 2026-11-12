<?php

header("Content-Type: application/json; charset=utf-8");

require_once "../Cores/auth.php";
requireRole(['admin', 'staff']);

require_once "../db.php";


/* ============================================================
   AUTHENTICATED ADMIN
============================================================ */

$department = strtoupper(trim((string) currentDepartment()));


/* ============================================================
   VALID DISPATCH DEPARTMENTS
============================================================ */

$allowedDepartments = [
    'IT',
    'BFP',
    'MCAT',
    'PSTMO'
];


/* ============================================================
   CHECK DEPARTMENT
============================================================ */

if (!in_array($department, $allowedDepartments, true)) {

    http_response_code(403);

    echo json_encode([
        "success" => false,
        "message" => "You are not authorized to access dispatch teams."
    ]);

    exit;
}


/* ============================================================
   GET SEARCH
============================================================ */

$search = trim((string) ($_GET['search'] ?? ""));


/* ============================================================
   BUILD QUERY
============================================================ */

try {

    $sql = "
        SELECT
            teamID,
            teamName,
            department,
            teamLeader,
            contactNumber,
            status,
            currentComplaintID,
            createdAt
        FROM tbl_dispatch_teams
        WHERE 1
    ";

    $params = [];


    /* ========================================================
       DEPARTMENT RBAC
       
       IT:
           Can see ALL departments.

       BFP:
           Can see BFP only.

       MCAT:
           Can see MCAT only.

       PSTMO:
           Can see PSTMO only.
    ======================================================== */

    if ($department !== 'IT') {

        $sql .= "
            AND department = ?
        ";

        $params[] = $department;
    }


    /* ========================================================
       SEARCH
    ======================================================== */

    if ($search !== "") {

        $sql .= "
            AND (
                teamName LIKE ?
                OR department LIKE ?
                OR teamLeader LIKE ?
                OR contactNumber LIKE ?
            )
        ";

        $searchTerm = "%{$search}%";

        $params[] = $searchTerm;
        $params[] = $searchTerm;
        $params[] = $searchTerm;
        $params[] = $searchTerm;
    }


    /* ========================================================
       ORDER
    ======================================================== */

    $sql .= "
        ORDER BY teamID ASC
    ";


    /* ========================================================
       EXECUTE
    ======================================================== */

    $stmt = $pdo->prepare($sql);

    $stmt->execute($params);

    $teams = $stmt->fetchAll(PDO::FETCH_ASSOC);


    /* ========================================================
       RETURN
    ======================================================== */

    echo json_encode([
        "success" => true,
        "teams" => $teams
    ]);

}

catch (PDOException $e) {

    error_log(
        "get_dispatchteams.php: " .
        $e->getMessage()
    );

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Database error while loading dispatch teams."
    ]);

}
<?php

header("Content-Type: application/json");

require_once "../db.php";

try {

    $status = $_GET['status'] ?? "All";
    $search = trim($_GET['search'] ?? "");

    $sql = "
        SELECT
            citizenID,
            fullName,
            email,
            contactNumber,
            CONCAT('/Complaint/uploads/', attachment) AS attachment,
            verificationStatus,
            createdAt
        FROM tbl_citizens
        WHERE 1
    ";

    $params = [];

    // Filter by status
    if ($status !== "All") {
        $sql .= " AND verificationStatus = ?";
        $params[] = $status;
    }

    // Search
    if (!empty($search)) {

        $sql .= " AND (
            fullName LIKE ?
            OR email LIKE ?
            OR contactNumber LIKE ?
        )";

        $searchTerm = "%{$search}%";

        $params[] = $searchTerm;
        $params[] = $searchTerm;
        $params[] = $searchTerm;
    }

    $sql .= " ORDER BY createdAt DESC";

    // Use $pdo instead of $conn
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));

} catch (PDOException $e) {

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);

}
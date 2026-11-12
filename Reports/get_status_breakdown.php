<?php

error_reporting(E_ALL);
ini_set('display_errors', 0);

session_start();

header('Content-Type: application/json');

require_once "../db.php";

try {

    $startDate = $_GET['startDate'] ?? date('Y-m-01');
    $endDate   = $_GET['endDate'] ?? date('Y-m-d');

    $endDateTime = $endDate . ' 23:59:59';


    $stmt = $pdo->prepare("
        SELECT
            status,
            COUNT(*) AS total
        FROM tbl_complaints
        WHERE createdAt BETWEEN ? AND ?
        GROUP BY status
        ORDER BY total DESC
    ");

    $stmt->execute([
        $startDate,
        $endDateTime
    ]);


    $data = [];

    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {

        $data[] = [
            'status' => $row['status'],
            'total'  => (int) $row['total']
        ];

    }


    echo json_encode([
        'success' => true,
        'data' => $data
    ]);

}
catch (Throwable $e) {

    http_response_code(500);

    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);

}
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

            SUM(
                CASE
                    WHEN deadlineAt IS NOT NULL
                    AND completedAt IS NOT NULL
                    THEN 1
                    ELSE 0
                END
            ) AS completed,

            SUM(
                CASE
                    WHEN deadlineAt IS NOT NULL
                    AND completedAt IS NOT NULL
                    AND completedAt <= deadlineAt
                    THEN 1
                    ELSE 0
                END
            ) AS withinSLA,

            SUM(
                CASE
                    WHEN deadlineAt IS NOT NULL
                    AND completedAt IS NOT NULL
                    AND completedAt > deadlineAt
                    THEN 1
                    ELSE 0
                END
            ) AS overdue,

            SUM(
                CASE
                    WHEN deadlineAt IS NOT NULL
                    AND completedAt IS NULL
                    AND NOW() > deadlineAt
                    THEN 1
                    ELSE 0
                END
            ) AS currentlyOverdue,

            SUM(
                CASE
                    WHEN deadlineAt IS NOT NULL
                    AND completedAt IS NULL
                    AND NOW() <= deadlineAt
                    THEN 1
                    ELSE 0
                END
            ) AS currentlyWithinSLA

        FROM tbl_complaints

        WHERE createdAt BETWEEN ? AND ?
    ");

    $stmt->execute([
        $startDate,
        $endDateTime
    ]);


    $data = $stmt->fetch(PDO::FETCH_ASSOC);


    $within =
        (int) ($data['withinSLA'] ?? 0);

    $overdue =
        (int) ($data['overdue'] ?? 0);

    $completed =
        (int) ($data['completed'] ?? 0);


    $rate =
        $completed > 0
            ? round(
                ($within / $completed) * 100,
                2
            )
            : 0;


    echo json_encode([

        'success' => true,

        'sla' => [

            'completed' =>
                $completed,

            'withinSLA' =>
                $within,

            'overdue' =>
                $overdue,

            'currentlyOverdue' =>
                (int) ($data['currentlyOverdue'] ?? 0),

            'currentlyWithinSLA' =>
                (int) ($data['currentlyWithinSLA'] ?? 0),

            'complianceRate' =>
                $rate

        ]

    ]);

}
catch (Throwable $e) {

    http_response_code(500);

    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);

}
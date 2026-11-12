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

            COUNT(*) AS total,

            AVG(rating) AS averageRating,

            SUM(
                CASE
                    WHEN rating = 5
                    THEN 1
                    ELSE 0
                END
            ) AS fiveStar,

            SUM(
                CASE
                    WHEN rating = 4
                    THEN 1
                    ELSE 0
                END
            ) AS fourStar,

            SUM(
                CASE
                    WHEN rating = 3
                    THEN 1
                    ELSE 0
                END
            ) AS threeStar,

            SUM(
                CASE
                    WHEN rating = 2
                    THEN 1
                    ELSE 0
                END
            ) AS twoStar,

            SUM(
                CASE
                    WHEN rating = 1
                    THEN 1
                    ELSE 0
                END
            ) AS oneStar

        FROM tbl_feedback

        WHERE createdAt BETWEEN ? AND ?
    ");

    $stmt->execute([
        $startDate,
        $endDateTime
    ]);


    $row = $stmt->fetch(PDO::FETCH_ASSOC);


    echo json_encode([

        'success' => true,

        'feedback' => [

            'total' =>
                (int) ($row['total'] ?? 0),

            'averageRating' =>
                round(
                    (float) ($row['averageRating'] ?? 0),
                    2
                ),

            'fiveStar' =>
                (int) ($row['fiveStar'] ?? 0),

            'fourStar' =>
                (int) ($row['fourStar'] ?? 0),

            'threeStar' =>
                (int) ($row['threeStar'] ?? 0),

            'twoStar' =>
                (int) ($row['twoStar'] ?? 0),

            'oneStar' =>
                (int) ($row['oneStar'] ?? 0)

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
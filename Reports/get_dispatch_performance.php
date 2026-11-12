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

            dt.teamID,

            dt.teamName,

            dt.department,

            COUNT(c.complaintID) AS assigned,

            SUM(
                CASE
                    WHEN c.arrivedAt IS NOT NULL
                    THEN 1
                    ELSE 0
                END
            ) AS arrived,

            SUM(
                CASE
                    WHEN c.completedAt IS NOT NULL
                    THEN 1
                    ELSE 0
                END
            ) AS completed,

            AVG(
                CASE
                    WHEN c.onTheWayAt IS NOT NULL
                    AND c.assignedAt IS NOT NULL
                    THEN TIMESTAMPDIFF(
                        SECOND,
                        c.assignedAt,
                        c.onTheWayAt
                    )
                END
            ) AS avgDispatchSeconds,

            AVG(
                CASE
                    WHEN c.arrivedAt IS NOT NULL
                    AND c.onTheWayAt IS NOT NULL
                    THEN TIMESTAMPDIFF(
                        SECOND,
                        c.onTheWayAt,
                        c.arrivedAt
                    )
                END
            ) AS avgArrivalSeconds

        FROM tbl_dispatch_teams dt

        LEFT JOIN tbl_complaints c
            ON c.dispatchTeamID = dt.teamID
            AND c.createdAt BETWEEN ? AND ?

        GROUP BY
            dt.teamID,
            dt.teamName,
            dt.department

        ORDER BY assigned DESC
    ");

    $stmt->execute([
        $startDate,
        $endDateTime
    ]);


    $teams = [];

    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {

        $teams[] = [

            'teamID' =>
                (int) $row['teamID'],

            'teamName' =>
                $row['teamName'],

            'department' =>
                $row['department'],

            'assigned' =>
                (int) $row['assigned'],

            'arrived' =>
                (int) $row['arrived'],

            'completed' =>
                (int) $row['completed'],

            'avgDispatchSeconds' =>
                round(
                    (float) ($row['avgDispatchSeconds'] ?? 0)
                ),

            'avgArrivalSeconds' =>
                round(
                    (float) ($row['avgArrivalSeconds'] ?? 0)
                )

        ];

    }


    echo json_encode([
        'success' => true,
        'teams' => $teams
    ]);

}
catch (Throwable $e) {

    http_response_code(500);

    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);

}
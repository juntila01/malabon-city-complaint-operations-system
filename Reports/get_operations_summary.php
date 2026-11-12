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


    /*
    |--------------------------------------------------------------------------
    | TOTAL COMPLAINTS
    |--------------------------------------------------------------------------
    */

    $stmt = $pdo->prepare("
        SELECT COUNT(*) AS total
        FROM tbl_complaints
        WHERE createdAt BETWEEN ? AND ?
    ");

    $stmt->execute([
        $startDate,
        $endDateTime
    ]);

    $total = (int) $stmt->fetch(PDO::FETCH_ASSOC)['total'];


    /*
    |--------------------------------------------------------------------------
    | STATUS COUNTS
    |--------------------------------------------------------------------------
    */

    $stmt = $pdo->prepare("
        SELECT
            status,
            COUNT(*) AS total
        FROM tbl_complaints
        WHERE createdAt BETWEEN ? AND ?
        GROUP BY status
    ");

    $stmt->execute([
        $startDate,
        $endDateTime
    ]);

    $statuses = [];

    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {

        $statuses[$row['status']] = (int) $row['total'];

    }


    /*
    |--------------------------------------------------------------------------
    | COMPLETED
    |--------------------------------------------------------------------------
    */

    $completed = $statuses['Resolved'] ?? 0;


    /*
    |--------------------------------------------------------------------------
    | AVERAGE FIRST RESPONSE
    |--------------------------------------------------------------------------
    */

    $stmt = $pdo->prepare("
        SELECT
            AVG(
                TIMESTAMPDIFF(
                    SECOND,
                    createdAt,
                    firstResponseAt
                )
            ) AS avgResponse
        FROM tbl_complaints
        WHERE createdAt BETWEEN ? AND ?
        AND firstResponseAt IS NOT NULL
    ");

    $stmt->execute([
        $startDate,
        $endDateTime
    ]);

    $avgResponse =
        $stmt->fetch(PDO::FETCH_ASSOC)['avgResponse'];


    /*
    |--------------------------------------------------------------------------
    | AVERAGE RESOLUTION TIME
    |--------------------------------------------------------------------------
    */

    $stmt = $pdo->prepare("
        SELECT
            AVG(
                TIMESTAMPDIFF(
                    SECOND,
                    createdAt,
                    completedAt
                )
            ) AS avgResolution
        FROM tbl_complaints
        WHERE createdAt BETWEEN ? AND ?
        AND completedAt IS NOT NULL
    ");

    $stmt->execute([
        $startDate,
        $endDateTime
    ]);

    $avgResolution =
        $stmt->fetch(PDO::FETCH_ASSOC)['avgResolution'];


    /*
    |--------------------------------------------------------------------------
    | SLA PERFORMANCE
    |--------------------------------------------------------------------------
    */

    $stmt = $pdo->prepare("
        SELECT

            SUM(
                CASE
                    WHEN completedAt IS NOT NULL
                    AND deadlineAt IS NOT NULL
                    THEN 1
                    ELSE 0
                END
            ) AS totalCompleted,

            SUM(
                CASE
                    WHEN completedAt IS NOT NULL
                    AND deadlineAt IS NOT NULL
                    AND completedAt <= deadlineAt
                    THEN 1
                    ELSE 0
                END
            ) AS withinSLA,

            SUM(
                CASE
                    WHEN completedAt IS NOT NULL
                    AND deadlineAt IS NOT NULL
                    AND completedAt > deadlineAt
                    THEN 1
                    ELSE 0
                END
            ) AS overdue

        FROM tbl_complaints

        WHERE createdAt BETWEEN ? AND ?
    ");

    $stmt->execute([
        $startDate,
        $endDateTime
    ]);

    $sla = $stmt->fetch(PDO::FETCH_ASSOC);


    $totalCompleted =
        (int) ($sla['totalCompleted'] ?? 0);

    $withinSLA =
        (int) ($sla['withinSLA'] ?? 0);

    $overdue =
        (int) ($sla['overdue'] ?? 0);


    $slaRate = $totalCompleted > 0
        ? round(
            ($withinSLA / $totalCompleted) * 100,
            2
        )
        : 0;


    /*
    |--------------------------------------------------------------------------
    | RESPONSE
    |--------------------------------------------------------------------------
    */

    echo json_encode([

        'success' => true,

        'period' => [
            'start' => $startDate,
            'end'   => $endDate
        ],

        'summary' => [

            'total' =>
                $total,

            'completed' =>
                $completed,

            'pending' =>
                $statuses['Pending'] ?? 0,

            'verified' =>
                $statuses['Verified'] ?? 0,

            'rejected' =>
                $statuses['Rejected'] ?? 0,

            'inProgress' =>
                $statuses['In Progress'] ?? 0,

            'resolved' =>
                $statuses['Resolved'] ?? 0,

            'unableToResolve' =>
                $statuses['Unable to Resolve'] ?? 0,

            'avgFirstResponseSeconds' =>
                round((float) ($avgResponse ?? 0)),

            'avgResolutionSeconds' =>
                round((float) ($avgResolution ?? 0)),

            'slaRate' =>
                $slaRate,

            'withinSLA' =>
                $withinSLA,

            'overdue' =>
                $overdue

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
<?php

header('Content-Type: application/json');

session_start();

require_once 'db.php';

try {

    /* ============================================================
       DATE RANGE
       ============================================================ */

    $from = $_GET['from'] ?? null;
    $to   = $_GET['to'] ?? null;

    /*
     * If no date range is supplied, default to the last 7 days.
     * This keeps the dashboard useful even if opened directly.
     */
    if (
        !$from ||
        !$to ||
        !preg_match('/^\d{4}-\d{2}-\d{2}$/', $from) ||
        !preg_match('/^\d{4}-\d{2}-\d{2}$/', $to)
    ) {
        $to   = date('Y-m-d');
        $from = date('Y-m-d', strtotime('-6 days'));
    }

    /*
     * Make sure From is not after To.
     */
    if ($from > $to) {
        $temp = $from;
        $from = $to;
        $to   = $temp;
    }


    /* ============================================================
       TREND PERIOD
       ============================================================ */

    $period = $_GET['period'] ?? 'custom';


    /* ============================================================
       DATE RANGE SQL
       
       Using:
           >= from 00:00:00
           <  to + 1 day

       ensures the entire "To" date is included.
       ============================================================ */

    $complaintDateCondition = "
        c.createdAt >= :fromDate
        AND c.createdAt < DATE_ADD(:toDate, INTERVAL 1 DAY)
    ";


    /* ============================================================
       HELPER
       ============================================================ */

    function getCount(
        PDO $pdo,
        string $sql,
        array $params = []
    ): int {

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);

        return (int)$stmt->fetchColumn();
    }
    /* ============================================================
   DEPARTMENT ACCESS FILTER
   ============================================================ */

$userDepartment =
    strtoupper(
        trim(
            $_SESSION['department'] ?? ''
        )
    );


/*
 * IT can see all complaints.
 */

$departmentCondition = "";


/*
 * BFP
 * - Fire
 * - HIGH Flood
 */

if ($userDepartment === 'BFP') {

    $departmentCondition = "
        AND (
            UPPER(ai.category) = 'FIRE'

            OR

            (
                UPPER(ai.category) = 'FLOOD'
                AND UPPER(ai.urgency) = 'HIGH'
            )
        )
    ";

}


/*
 * MCAT
 * - Obstruction
 * - NORMAL Flood
 */

elseif ($userDepartment === 'MCAT') {

    $departmentCondition = "
        AND (
            UPPER(ai.category) = 'OBSTRUCTION'

            OR

            (
                UPPER(ai.category) = 'FLOOD'
                AND UPPER(ai.urgency) = 'NORMAL'
            )
        )
    ";

}


/*
 * PSTMO
 * - Traffic
 */

elseif ($userDepartment === 'PSTMO') {

    $departmentCondition = "
        AND UPPER(ai.category) = 'TRAFFIC'
    ";

}


/*
 * IT
 * - No restriction
 */

elseif ($userDepartment === 'IT') {

    $departmentCondition = "";

}


/*
 * Unknown department
 * - Show no complaints.
 */

else {

    $departmentCondition = "
        AND 1 = 0
    ";

}


    /* ============================================================
       COMMON DATE PARAMETERS
       ============================================================ */

    $dateParams = [
        ':fromDate' => $from,
        ':toDate'   => $to
    ];


    /* ============================================================
       METRICS
       
       Complaint metrics are filtered by the selected date range.
       Citizen/system-user counts remain overall counts because
       those are not complaint activity metrics.
       ============================================================ */

    $metrics = [

        "total" => getCount(
    $pdo,
    "
        SELECT COUNT(*)
        FROM tbl_complaints c

        LEFT JOIN tbl_ai_analysis ai
            ON ai.complaintID = c.complaintID

        WHERE
            $complaintDateCondition

            $departmentCondition
    ",
    $dateParams
),

        "pending" => getCount(
    $pdo,
    "
        SELECT COUNT(*)
        FROM tbl_complaints c

        LEFT JOIN tbl_ai_analysis ai
            ON ai.complaintID = c.complaintID

        WHERE
            $complaintDateCondition

            AND LOWER(TRIM(c.status)) = 'pending'

            $departmentCondition
    ",
    $dateParams
),

        "citizens" => getCount(
            $pdo,
            "
                SELECT COUNT(*)
                FROM tbl_citizens
                WHERE verificationStatus = 'Verified'
            "
        ),

        "users" => getCount(
            $pdo,
            "
                SELECT COUNT(*)
                FROM tbl_systemusers
            "
        )

    ];


    /* ============================================================
       RECENT COMPLAINTS
       
       Used by the dashboard and especially the Pending Complaints
       hover card.
       
       AI information comes from tbl_ai_analysis.
       ============================================================ */

    $stmt = $pdo->prepare("

        SELECT

            c.complaintID,

            ct.fullName,

            c.rawComplaintText,

            ai.category AS aiCategory,

            ai.urgency AS aiUrgency,

            ai.location AS aiLocation,

            c.status,

            c.createdAt

        FROM tbl_complaints c

        LEFT JOIN tbl_citizens ct
            ON c.citizenID = ct.citizenID

        LEFT JOIN tbl_ai_analysis ai
            ON c.complaintID = ai.complaintID

        WHERE
            $complaintDateCondition

            $departmentCondition

        ORDER BY c.createdAt DESC
        LIMIT 20
    ");

    $stmt->execute($dateParams);

    $recentComplaints =
        $stmt->fetchAll(PDO::FETCH_ASSOC);


    /* ============================================================
       PENDING COMPLAINTS
       
       Separate query so the dashboard does not depend on whether
       the general recent-complaints list happens to contain enough
       pending records.
       ============================================================ */

    $stmt = $pdo->prepare("

        SELECT

            c.complaintID,

            ct.fullName,

            c.rawComplaintText,

            ai.category AS aiCategory,

            ai.urgency AS aiUrgency,

            ai.location AS aiLocation,

            c.status,

            c.createdAt

        FROM tbl_complaints c

        LEFT JOIN tbl_citizens ct
            ON c.citizenID = ct.citizenID

        LEFT JOIN tbl_ai_analysis ai
            ON c.complaintID = ai.complaintID

        WHERE
            $complaintDateCondition

            AND LOWER(TRIM(c.status)) IN (
                'pending',
                'awaiting'
            )

            $departmentCondition

        ORDER BY c.createdAt DESC
        LIMIT 8

    ");

    $stmt->execute($dateParams);

    $pendingComplaints =
        $stmt->fetchAll(PDO::FETCH_ASSOC);


    /* ============================================================
       RECENT REGISTERED CITIZENS
       
       Kept for compatibility with other dashboard code even though
       the redesigned dashboard no longer displays this section.
       ============================================================ */

    $stmt = $pdo->query("

        SELECT

            citizenID,

            fullName,

            email,

            verificationStatus,

            createdAt

        FROM tbl_citizens

        ORDER BY createdAt DESC

        LIMIT 5

    ");

    $recentUsers =
        $stmt->fetchAll(PDO::FETCH_ASSOC);


    /* ============================================================
       COMPLAINT TREND
       
       Automatically chooses the most appropriate granularity:

       <= 31 days  : Daily
       <= 90 days  : Weekly
       > 90 days   : Monthly

       This allows the From / To filter to work across historical
       weeks and months.
       ============================================================ */

    $fromTimestamp = strtotime($from);
    $toTimestamp   = strtotime($to);

    $rangeDays =
        (int)floor(
            ($toTimestamp - $fromTimestamp) / 86400
        ) + 1;


    if ($rangeDays <= 31) {

        /*
         * DAILY
         */

        $trendSQL = "

            SELECT

                DATE(c.createdAt) AS period,

                COALESCE(ai.category, 'Uncategorized')
                    AS aiCategory,

                COUNT(*) AS total

            FROM tbl_complaints c

            LEFT JOIN tbl_ai_analysis ai
                ON c.complaintID = ai.complaintID

            WHERE
                $complaintDateCondition

                $departmentCondition

            GROUP BY
                DATE(c.createdAt),
                COALESCE(ai.category, 'Uncategorized')

            ORDER BY
                DATE(c.createdAt),
                aiCategory

        ";

    }
    elseif ($rangeDays <= 90) {

        /*
         * WEEKLY
         *
         * YEARWEEK(..., 1) uses ISO-style Monday-based weeks.
         */

        $trendSQL = "

            SELECT

                YEARWEEK(c.createdAt, 1) AS period,

                COALESCE(ai.category, 'Uncategorized')
                    AS aiCategory,

                COUNT(*) AS total

            FROM tbl_complaints c

            LEFT JOIN tbl_ai_analysis ai
                ON c.complaintID = ai.complaintID

            WHERE
                $complaintDateCondition

                $departmentCondition

            GROUP BY
                YEARWEEK(c.createdAt, 1),
                COALESCE(ai.category, 'Uncategorized')

            ORDER BY
                YEARWEEK(c.createdAt, 1),
                aiCategory

        ";

    }
    else {

        /*
         * MONTHLY
         */

        $trendSQL = "

            SELECT

                DATE_FORMAT(
                    c.createdAt,
                    '%Y-%m'
                ) AS period,

                COALESCE(ai.category, 'Uncategorized')
                    AS aiCategory,

                COUNT(*) AS total

            FROM tbl_complaints c

            LEFT JOIN tbl_ai_analysis ai
                ON c.complaintID = ai.complaintID

            WHERE
                $complaintDateCondition

                $departmentCondition

            GROUP BY
                DATE_FORMAT(
                    c.createdAt,
                    '%Y-%m'
                ),
                COALESCE(ai.category, 'Uncategorized')

            ORDER BY
                DATE_FORMAT(
                    c.createdAt,
                    '%Y-%m'
                ),
                aiCategory

        ";

    }


    $stmt = $pdo->prepare($trendSQL);

    $stmt->execute($dateParams);

    $trendRows =
        $stmt->fetchAll(PDO::FETCH_ASSOC);


    /* ============================================================
       FORMAT TREND
       ============================================================ */

    $trend = [];

    foreach ($trendRows as $row) {

        $periodValue =
            (string)$row['period'];

        $category =
            !empty($row['aiCategory'])
                ? $row['aiCategory']
                : 'Uncategorized';

        $total =
            (int)$row['total'];


        if (!isset($trend[$periodValue])) {

            $trend[$periodValue] = [

                "period" =>
                    $periodValue,

                "categories" =>
                    []

            ];

        }


        $trend[$periodValue]["categories"][$category] =
            $total;

    }


    $trend =
        array_values($trend);


    /* ============================================================
       CHART - CATEGORY DISTRIBUTION
       
       Filtered according to the selected From / To range.
       ============================================================ */

    $stmt = $pdo->prepare("

        SELECT

            COALESCE(
                ai.category,
                'Uncategorized'
            ) AS category,

            COUNT(*) AS total

        FROM tbl_complaints c

        LEFT JOIN tbl_ai_analysis ai
            ON c.complaintID = ai.complaintID

        WHERE
            $complaintDateCondition

            $departmentCondition

        GROUP BY
            COALESCE(
                ai.category,
                'Uncategorized'
            )

        ORDER BY
            total DESC

    ");

    $stmt->execute($dateParams);

    $categories =
        $stmt->fetchAll(PDO::FETCH_ASSOC);


    /* ============================================================
       CHART - STATUS
       
       Filtered by selected date range.
       ============================================================ */

    $stmt = $pdo->prepare("

    SELECT
        COALESCE(
            c.status,
            'Unknown'
        ) AS status,
        COUNT(*) AS total

    FROM tbl_complaints c

    LEFT JOIN tbl_ai_analysis ai
        ON ai.complaintID = c.complaintID

    WHERE
        $complaintDateCondition

        $departmentCondition

        GROUP BY
            COALESCE(
                c.status,
                'Unknown'
            )

        ORDER BY
            total DESC

    ");

    $stmt->execute($dateParams);

    $status =
        $stmt->fetchAll(PDO::FETCH_ASSOC);


    /* ============================================================
       CHART - URGENCY
       
       Urgency comes from tbl_ai_analysis.
       ============================================================ */

    $stmt = $pdo->prepare("

        SELECT

            COALESCE(
                ai.urgency,
                'UNKNOWN'
            ) AS urgency,

            COUNT(*) AS total

        FROM tbl_complaints c

        LEFT JOIN tbl_ai_analysis ai
            ON c.complaintID = ai.complaintID

        WHERE
            $complaintDateCondition

            $departmentCondition

        GROUP BY
            COALESCE(
                ai.urgency,
                'UNKNOWN'
            )

        ORDER BY
            total DESC

    ");

    $stmt->execute($dateParams);

    $urgency =
        $stmt->fetchAll(PDO::FETCH_ASSOC);


    /* ============================================================
       CHART - SLA
       
       SLA remains in tbl_complaints.
       ============================================================ */

    $stmt = $pdo->prepare("

    SELECT

        COALESCE(

            c.slaStatus,

            'Not Set'

        ) AS slaStatus,

        COUNT(*) AS total

    FROM tbl_complaints c

    LEFT JOIN tbl_ai_analysis ai

        ON ai.complaintID = c.complaintID

    WHERE

        $complaintDateCondition

        $departmentCondition

    GROUP BY

        COALESCE(

            c.slaStatus,

            'Not Set'

        )

    ORDER BY

        total DESC

");

    $stmt->execute($dateParams);

    $sla =
        $stmt->fetchAll(PDO::FETCH_ASSOC);


    /* ============================================================
       TREND TOTAL
       
       Gives the frontend a reliable total for the selected range.
       ============================================================ */

   $trendTotal =
    getCount(
        $pdo,
        "
            SELECT COUNT(*)
            FROM tbl_complaints c

            LEFT JOIN tbl_ai_analysis ai
                ON ai.complaintID = c.complaintID

            WHERE
                $complaintDateCondition

                $departmentCondition
        ",
        $dateParams
    );


    /* ============================================================
       JSON RESPONSE
       ============================================================ */

    echo json_encode([

        "success" => true,

        "dateRange" => [

            "from" =>
                $from,

            "to" =>
                $to

        ],

        "rangeDays" =>
            $rangeDays,

        "metrics" =>
            $metrics,

        "recentComplaints" =>
            $recentComplaints,

        "pendingComplaints" =>
            $pendingComplaints,

        "recentUsers" =>
            $recentUsers,

        "charts" => [

            "trend" =>
                $trend,

            "trendTotal" =>
                $trendTotal,

            "categories" =>
                $categories,

            "status" =>
                $status,

            "urgency" =>
                $urgency,

            "sla" =>
                $sla

        ]

    ]);

}
catch (PDOException $e) {

    http_response_code(500);

    echo json_encode([

        "success" => false,

        "message" =>
            $e->getMessage()

    ]);

}
catch (Exception $e) {

    http_response_code(500);

    echo json_encode([

        "success" => false,

        "message" =>
            $e->getMessage()

    ]);

}


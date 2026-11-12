<?php
error_reporting(E_ALL);
ini_set('display_errors', '0');

session_start();

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate');

require_once __DIR__ . '/../db.php';

/*
|--------------------------------------------------------------------------
| AUTHORIZATION
|--------------------------------------------------------------------------
| Use the same role authorization as the admin dashboard.
*/
require_once __DIR__ . '/../Cores/auth.php';

if (function_exists('requireRole')) {
    requireRole(['admin', 'staff']);
}

/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

function reportJson(array $data, int $statusCode = 200): void
{
    http_response_code($statusCode);

    echo json_encode(
        $data,
        JSON_UNESCAPED_UNICODE
        | JSON_INVALID_UTF8_SUBSTITUTE
        | JSON_PARTIAL_OUTPUT_ON_ERROR
    );

    exit;
}

function validReportDate(string $date): bool
{
    $parsed = DateTime::createFromFormat('!Y-m-d', $date);
    $errors = DateTime::getLastErrors();

    return $parsed !== false
        && $parsed->format('Y-m-d') === $date
        && (
            $errors === false
            || (
                $errors['warning_count'] === 0
                && $errors['error_count'] === 0
            )
        );
}

function reportLocationExpression(): string
{
    return "COALESCE(NULLIF(TRIM(ai.location), ''), 'Unknown')";
}

function reportCategoryExpression(): string
{
    return "
        CASE
            WHEN ai.category IS NULL
                OR TRIM(ai.category) = ''
                OR LOWER(TRIM(ai.category)) = 'uncategorized'
            THEN 'Uncategorized'
            ELSE TRIM(ai.category)
        END
    ";
}

function reportUrgencyExpression(): string
{
    return "
        CASE
            WHEN UPPER(TRIM(COALESCE(ai.urgency, ''))) IN ('HIGH', 'NORMAL')
            THEN UPPER(TRIM(ai.urgency))
            ELSE 'Unknown'
        END
    ";
}

/*
|--------------------------------------------------------------------------
| MAIN
|--------------------------------------------------------------------------
*/

try {
    /*
    |--------------------------------------------------------------------------
    | 1. VALIDATE FILTERS
    |--------------------------------------------------------------------------
    */

    $startDate = $_GET['startDate'] ?? date('Y-01-01');
    $endDate = $_GET['endDate'] ?? date('Y-m-d');

    if (
        !is_string($startDate)
        || !is_string($endDate)
        || !validReportDate($startDate)
        || !validReportDate($endDate)
    ) {
        reportJson([
            'success' => false,
            'message' => 'Invalid reporting dates.'
        ], 400);
    }

    if ($startDate > $endDate) {
        reportJson([
            'success' => false,
            'message' => 'Start date cannot be later than end date.'
        ], 400);
    }

    $category = trim((string) ($_GET['category'] ?? ''));
    $urgency = strtoupper(trim((string) ($_GET['urgency'] ?? '')));
    $status = trim((string) ($_GET['status'] ?? ''));
    $location = trim((string) ($_GET['location'] ?? ''));

    $allowedCategories = [
        '',
        'Fire',
        'Flood',
        'Obstruction',
        'Traffic',
        'Uncategorized'
    ];

    $allowedUrgencies = ['', 'HIGH', 'NORMAL'];

    $allowedStatuses = [
        '',
        'Pending',
        'Verified',
        'In Progress',
        'Resolved',
        'Rejected',
        'Unable to Resolve'
    ];

    if (!in_array($category, $allowedCategories, true)) {
        reportJson([
            'success' => false,
            'message' => 'Invalid incident category.'
        ], 400);
    }

    if (!in_array($urgency, $allowedUrgencies, true)) {
        reportJson([
            'success' => false,
            'message' => 'Invalid urgency level.'
        ], 400);
    }

    if (!in_array($status, $allowedStatuses, true)) {
        reportJson([
            'success' => false,
            'message' => 'Invalid complaint status.'
        ], 400);
    }

    /*
    |--------------------------------------------------------------------------
    | 2. SHARED FILTER BUILDER
    |--------------------------------------------------------------------------
    | The historical pattern query intentionally excludes date and status
    | filters while retaining category, urgency, and location filters.
    */

    $buildWhere = function (
        bool $includeDates = true,
        bool $includeStatus = true
    ) use (
        $startDate,
        $endDate,
        $category,
        $urgency,
        $status,
        $location
    ): array {
        $conditions = [];
        $params = [];

        if ($includeDates) {
            $conditions[] = "
                c.createdAt >= ?
                AND c.createdAt < DATE_ADD(?, INTERVAL 1 DAY)
            ";

            $params[] = $startDate;
            $params[] = $endDate;
        }

        if ($category !== '') {
            if ($category === 'Uncategorized') {
                $conditions[] = "
                    (
                        ai.category IS NULL
                        OR TRIM(ai.category) = ''
                        OR LOWER(TRIM(ai.category)) = 'uncategorized'
                    )
                ";
            } else {
                $conditions[] = "
                    LOWER(TRIM(ai.category)) = LOWER(?)
                ";

                $params[] = $category;
            }
        }

        if ($urgency !== '') {
            $conditions[] = "UPPER(TRIM(ai.urgency)) = ?";
            $params[] = $urgency;
        }

        if ($includeStatus && $status !== '') {
            $conditions[] = "LOWER(TRIM(c.status)) = LOWER(?)";
            $params[] = $status;
        }

        if ($location !== '') {
            $conditions[] = reportLocationExpression() . " = ?";
            $params[] = $location;
        }

        return [
            'where' => $conditions
                ? ' WHERE ' . implode(' AND ', $conditions)
                : '',
            'params' => $params
        ];
    };

    $filtered = $buildWhere(true, true);
    $where = $filtered['where'];
    $params = $filtered['params'];

    /*
    |--------------------------------------------------------------------------
    | 3. SUMMARY CARDS
    |--------------------------------------------------------------------------
    */

    $stmt = $pdo->prepare("
        SELECT
            COUNT(*) AS total,

            COALESCE(SUM(
                CASE
                    WHEN UPPER(TRIM(COALESCE(ai.urgency, ''))) = 'HIGH'
                    THEN 1 ELSE 0
                END
            ), 0) AS highUrgency,

            COALESCE(SUM(
                CASE
                    WHEN LOWER(TRIM(COALESCE(c.status, ''))) = 'resolved'
                    THEN 1 ELSE 0
                END
            ), 0) AS resolved,

            COALESCE(SUM(
                CASE
                    WHEN LOWER(TRIM(COALESCE(c.status, '')))
                        NOT IN ('resolved', 'rejected')
                    THEN 1 ELSE 0
                END
            ), 0) AS active

        FROM tbl_complaints c

        LEFT JOIN tbl_ai_analysis ai
            ON ai.complaintID = c.complaintID

        $where
    ");

    $stmt->execute($params);
    $row = $stmt->fetch(PDO::FETCH_ASSOC) ?: [];

    $summary = [
        'total' => (int) ($row['total'] ?? 0),
        'highUrgency' => (int) ($row['highUrgency'] ?? 0),
        'resolved' => (int) ($row['resolved'] ?? 0),
        'active' => (int) ($row['active'] ?? 0)
    ];

    /*
    |--------------------------------------------------------------------------
    | 4. MONTHLY TREND
    |--------------------------------------------------------------------------
    | Includes months with zero complaints between the selected dates.
    */

    $stmt = $pdo->prepare("
        SELECT
            DATE_FORMAT(c.createdAt, '%Y-%m') AS monthKey,
            COUNT(*) AS total

        FROM tbl_complaints c

        LEFT JOIN tbl_ai_analysis ai
            ON ai.complaintID = c.complaintID

        $where

        GROUP BY YEAR(c.createdAt), MONTH(c.createdAt)

        ORDER BY YEAR(c.createdAt), MONTH(c.createdAt)
    ");

    $stmt->execute($params);

    $monthlyTotals = [];

    foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
        $monthlyTotals[$row['monthKey']] = (int) $row['total'];
    }

    $monthlyTrend = [];

    $monthCursor = new DateTime(
        substr($startDate, 0, 7) . '-01'
    );

    $lastMonth = new DateTime(
        substr($endDate, 0, 7) . '-01'
    );

    while ($monthCursor <= $lastMonth) {
        $monthKey = $monthCursor->format('Y-m');

        $monthlyTrend[] = [
            'monthKey' => $monthKey,
            'label' => $monthCursor->format('M Y'),
            'total' => $monthlyTotals[$monthKey] ?? 0
        ];

        $monthCursor->modify('+1 month');
    }

    /*
    |--------------------------------------------------------------------------
    | 5. CATEGORY BREAKDOWN
    |--------------------------------------------------------------------------
    */

    $categoryExpression = reportCategoryExpression();

    $stmt = $pdo->prepare("
        SELECT
            $categoryExpression AS label,
            COUNT(*) AS total

        FROM tbl_complaints c

        LEFT JOIN tbl_ai_analysis ai
            ON ai.complaintID = c.complaintID

        $where

        GROUP BY label
        ORDER BY total DESC, label ASC
    ");

    $stmt->execute($params);

    $categoryBreakdown = array_map(
        static fn($row) => [
            'label' => $row['label'],
            'total' => (int) $row['total']
        ],
        $stmt->fetchAll(PDO::FETCH_ASSOC)
    );

    /*
    |--------------------------------------------------------------------------
    | 6. URGENCY BREAKDOWN
    |--------------------------------------------------------------------------
    */

    $urgencyExpression = reportUrgencyExpression();

    $stmt = $pdo->prepare("
        SELECT
            $urgencyExpression AS label,
            COUNT(*) AS total

        FROM tbl_complaints c

        LEFT JOIN tbl_ai_analysis ai
            ON ai.complaintID = c.complaintID

        $where

        GROUP BY label
        ORDER BY total DESC, label ASC
    ");

    $stmt->execute($params);

    $urgencyBreakdown = array_map(
        static fn($row) => [
            'label' => $row['label'],
            'total' => (int) $row['total']
        ],
        $stmt->fetchAll(PDO::FETCH_ASSOC)
    );

    /*
    |--------------------------------------------------------------------------
    | 7. STATUS BREAKDOWN
    |--------------------------------------------------------------------------
    */

    $stmt = $pdo->prepare("
        SELECT
            COALESCE(NULLIF(TRIM(c.status), ''), 'Unknown') AS label,
            COUNT(*) AS total

        FROM tbl_complaints c

        LEFT JOIN tbl_ai_analysis ai
            ON ai.complaintID = c.complaintID

        $where

        GROUP BY label
        ORDER BY total DESC, label ASC
    ");

    $stmt->execute($params);

    $statusBreakdown = array_map(
        static fn($row) => [
            'label' => $row['label'],
            'total' => (int) $row['total']
        ],
        $stmt->fetchAll(PDO::FETCH_ASSOC)
    );

    /*
    |--------------------------------------------------------------------------
    | 8. LOCATION COMPARISON
    |--------------------------------------------------------------------------
    */

    $locationExpression = reportLocationExpression();

    $stmt = $pdo->prepare("
        SELECT
            $locationExpression AS location,
            COUNT(*) AS total,

            COALESCE(SUM(
                CASE
                    WHEN UPPER(TRIM(COALESCE(ai.urgency, ''))) = 'HIGH'
                    THEN 1 ELSE 0
                END
            ), 0) AS highUrgency,

            COALESCE(SUM(
                CASE
                    WHEN LOWER(TRIM(COALESCE(c.status, '')))
                        NOT IN ('resolved', 'rejected')
                    THEN 1 ELSE 0
                END
            ), 0) AS active

        FROM tbl_complaints c

        LEFT JOIN tbl_ai_analysis ai
            ON ai.complaintID = c.complaintID

        $where

        GROUP BY location
        ORDER BY total DESC, location ASC
    ");

    $stmt->execute($params);

    $locationBreakdown = [];

    foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
        $key = $row['location'];

        $locationBreakdown[$key] = [
            'location' => $key,
            'total' => (int) $row['total'],
            'highUrgency' => (int) $row['highUrgency'],
            'active' => (int) $row['active'],
            'topCategory' => 'Unknown'
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | 9. TOP CATEGORY PER LOCATION
    |--------------------------------------------------------------------------
    */

    $stmt = $pdo->prepare("
        SELECT
            $locationExpression AS location,
            $categoryExpression AS category,
            COUNT(*) AS total

        FROM tbl_complaints c

        LEFT JOIN tbl_ai_analysis ai
            ON ai.complaintID = c.complaintID

        $where

        GROUP BY location, category
        ORDER BY location ASC, total DESC, category ASC
    ");

    $stmt->execute($params);

    $seenLocations = [];

    foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
        $key = $row['location'];

        if (
            isset($locationBreakdown[$key])
            && !isset($seenLocations[$key])
        ) {
            $locationBreakdown[$key]['topCategory'] = $row['category'];
            $seenLocations[$key] = true;
        }
    }

    $locationBreakdown = array_values($locationBreakdown);

    /*
    |--------------------------------------------------------------------------
    | 10. LOCATION FILTER OPTIONS
    |--------------------------------------------------------------------------
    */

    $stmt = $pdo->query("
        SELECT DISTINCT
            COALESCE(NULLIF(TRIM(location), ''), 'Unknown') AS location

        FROM tbl_ai_analysis

        ORDER BY location ASC
    ");

    $locationOptions = array_map(
        static fn($row) => $row['location'],
        $stmt->fetchAll(PDO::FETCH_ASSOC)
    );

    if (!in_array('Unknown', $locationOptions, true)) {
        $locationOptions[] = 'Unknown';
    }

    /*
    |--------------------------------------------------------------------------
    | 11. DETAILED RECORDS
    |--------------------------------------------------------------------------
    */

    $stmt = $pdo->prepare("
        SELECT
            c.complaintID,
            c.complaintReference AS reference,
            c.createdAt,

            $locationExpression AS location,
            $categoryExpression AS category,
            $urgencyExpression AS urgency,

            COALESCE(NULLIF(TRIM(c.status), ''), 'Unknown') AS status

        FROM tbl_complaints c

        LEFT JOIN tbl_ai_analysis ai
            ON ai.complaintID = c.complaintID

        $where

        ORDER BY c.createdAt DESC, c.complaintID DESC
    ");

    $stmt->execute($params);

    $records = array_map(
        static function ($row) {
            return [
                'complaintID' => (int) $row['complaintID'],
                'reference' => $row['reference'],
                'createdAt' => $row['createdAt'],
                'location' => $row['location'],
                'category' => $row['category'],
                'urgency' => $row['urgency'],
                'status' => $row['status']
            ];
        },
        $stmt->fetchAll(PDO::FETCH_ASSOC)
    );

    /*
    |--------------------------------------------------------------------------
    | 12. HISTORICAL MONTHLY PATTERN
    |--------------------------------------------------------------------------
    | Uses records from all years for the month containing endDate.
    | This is a historical comparison, not a guaranteed prediction.
    */

    $historicalFilters = $buildWhere(false, false);

    $historicalWhere = $historicalFilters['where'];
    $historicalParams = $historicalFilters['params'];

    $targetMonth = (int) date('n', strtotime($endDate));
    $targetMonthName = date('F', strtotime($endDate));

    $stmt = $pdo->prepare("
        SELECT
            YEAR(c.createdAt) AS reportYear,
            MONTH(c.createdAt) AS reportMonth,
            COUNT(*) AS total

        FROM tbl_complaints c

        LEFT JOIN tbl_ai_analysis ai
            ON ai.complaintID = c.complaintID

        $historicalWhere

        GROUP BY YEAR(c.createdAt), MONTH(c.createdAt)

        ORDER BY YEAR(c.createdAt), MONTH(c.createdAt)
    ");

    $stmt->execute($historicalParams);

    $historicalRows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $yearlyCounts = [];
    $allMonthCounts = [];

    foreach ($historicalRows as $row) {
        $year = (int) $row['reportYear'];
        $month = (int) $row['reportMonth'];
        $count = (int) $row['total'];

        $allMonthCounts[] = $count;

        if ($month === $targetMonth) {
            $yearlyCounts[$year] = $count;
        }
    }

    $predictions = [];

    if (count($yearlyCounts) >= 2) {
        $targetCounts = array_values($yearlyCounts);

        $averageTargetMonth =
            array_sum($targetCounts) / count($targetCounts);

        $averageObservedMonth = count($allMonthCounts)
            ? array_sum($allMonthCounts) / count($allMonthCounts)
            : 0;

        $latestYear = max(array_keys($yearlyCounts));
        $latestCount = $yearlyCounts[$latestYear];

        $level = 'HISTORICAL PATTERN';

        if (
            $averageObservedMonth > 0
            && $averageTargetMonth >= ($averageObservedMonth * 1.5)
        ) {
            $level = 'ELEVATED';
        }

        $predictions[] = [
            'level' => $level,
            'title' => $targetMonthName . ' historical incident pattern',

            'description' =>
                'Across ' . count($yearlyCounts) .
                ' year(s) with records for ' . $targetMonthName .
                ', the average was ' .
                number_format($averageTargetMonth, 1) .
                ' complaint(s) per year. The latest recorded ' .
                $targetMonthName . ' count was ' . $latestCount .
                ' in ' . $latestYear .
                '. This is a historical comparison, not a guarantee of future incidents.',

            'recommendation' =>
                'Review locations that repeatedly report incidents in this month, ' .
                'check relevant equipment and response readiness, and coordinate ' .
                'preventive planning with the responsible barangay and response teams.',

            'evidence' =>
                'Historical years with matching-month records: ' .
                implode(', ', array_keys($yearlyCounts)) .
                '. Average across months with recorded complaints: ' .
                number_format($averageObservedMonth, 1) . '.'
        ];
    } elseif (count($yearlyCounts) === 1) {
        $year = (int) array_key_first($yearlyCounts);
        $count = (int) $yearlyCounts[$year];

        $predictions[] = [
            'level' => 'LIMITED HISTORY',
            'title' => $targetMonthName . ' historical record',

            'description' =>
                'Only one year (' . $year . ') has a recorded count for ' .
                $targetMonthName . ': ' . $count .
                ' complaint(s). This is not enough to establish a reliable seasonal pattern.',

            'recommendation' =>
                'Use this as an initial reference and continue collecting records ' .
                'across future years before relying on a seasonal forecast.',

            'evidence' =>
                'One year of matching historical records; no multi-year seasonal comparison.'
        ];
    } else {
        $predictions[] = [
            'level' => 'LIMITED HISTORY',
            'title' => 'Insufficient historical data',

            'description' =>
                'There are not enough matching historical records for ' .
                $targetMonthName . ' to calculate a meaningful seasonal comparison.',

            'recommendation' =>
                'Continue collecting and reviewing complaint records over multiple years.',

            'evidence' =>
                'No matching-month historical records were found for the selected filters.'
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | 13. RESPONSE
    |--------------------------------------------------------------------------
    */

    reportJson([
        'success' => true,

        'period' => [
            'start' => $startDate,
            'end' => $endDate
        ],

        'filters' => [
            'locations' => $locationOptions
        ],

        'summary' => $summary,
        'monthlyTrend' => $monthlyTrend,
        'categoryBreakdown' => $categoryBreakdown,
        'urgencyBreakdown' => $urgencyBreakdown,
        'statusBreakdown' => $statusBreakdown,
        'locationBreakdown' => $locationBreakdown,
        'predictions' => $predictions,
        'records' => $records
    ]);

} catch (Throwable $e) {
    error_log(
        'MCAT Operations Analytics Error: ' . $e->getMessage()
    );

    reportJson([
        'success' => false,
        'message' => 'Unable to generate analytics. Check the PHP error log.'
    ], 500);
}
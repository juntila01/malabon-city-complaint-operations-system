<?php

session_start();

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate');

require_once __DIR__ . "/Cores/auth.php";

requireRole(['admin', 'staff']);

require_once __DIR__ . "/db.php";

try {

    /*
    |--------------------------------------------------------------------------
    | CURRENT USER
    |--------------------------------------------------------------------------
    */

    $role = strtolower(trim((string) currentRole()));
    $department = strtoupper(trim((string) currentDepartment()));

    /*
    |--------------------------------------------------------------------------
    | DEPARTMENT ACCESS
    |--------------------------------------------------------------------------
    |
    | IT                  : All departments
    | Global Admin        : All departments
    | BFP                 : Fire + High Urgency Flood
    | MCAT                : Obstruction + Normal Urgency Flood
    | PSTMO               : Traffic
    | Unknown Department  : No notifications
    |
    */

    $departmentCondition = "";

    if ($department === "IT") {

        // IT can view notifications from all departments.

        $departmentCondition = "";

    } elseif ($department === "BFP") {

        $departmentCondition = "
            AND (
                UPPER(TRIM(COALESCE(ai.category, ''))) = 'FIRE'

                OR (
                    UPPER(TRIM(COALESCE(ai.category, ''))) = 'FLOOD'
                    AND UPPER(TRIM(COALESCE(ai.urgency, ''))) = 'HIGH'
                )
            )
        ";

    } elseif ($department === "MCAT") {

        $departmentCondition = "
            AND (
                UPPER(TRIM(COALESCE(ai.category, ''))) = 'OBSTRUCTION'

                OR (
                    UPPER(TRIM(COALESCE(ai.category, ''))) = 'FLOOD'
                    AND UPPER(TRIM(COALESCE(ai.urgency, ''))) = 'NORMAL'
                )
            )
        ";

    } elseif ($department === "PSTMO") {

        $departmentCondition = "
            AND UPPER(TRIM(COALESCE(ai.category, ''))) = 'TRAFFIC'
        ";

    } elseif ($role === "admin" && $department === "") {

        // Global administrators can view all departments.

        $departmentCondition = "";

    } else {

        // Deny notifications to unrecognized department assignments.

        $departmentCondition = " AND 1 = 0 ";

    }

    /*
    |--------------------------------------------------------------------------
    | NOTIFICATION QUERY
    |--------------------------------------------------------------------------
    |
    | HIGH_PRIORITY:
    | Active complaints with HIGH urgency.
    |
    | OVERDUE:
    | Active complaints whose response deadline has passed.
    |
    | Resolved and rejected complaints are excluded.
    | Newest complaints appear first.
    |
    */

    $sql = "
        SELECT
            c.complaintID,
            c.complaintReference,
            c.status,
            c.dispatchStatus,
            c.deadlineAt,
            c.createdAt,

            ai.category,
            ai.urgency,
            ai.location,
            ai.summary,

            CASE
                WHEN UPPER(TRIM(COALESCE(ai.urgency, ''))) = 'HIGH'
                    THEN 'HIGH_PRIORITY'
                ELSE 'OVERDUE'
            END AS notificationType,

            CASE
                WHEN UPPER(TRIM(COALESCE(ai.urgency, ''))) = 'HIGH'
                    THEN 'High-priority incident requires attention'
                ELSE 'Complaint response deadline has passed'
            END AS notificationTitle

        FROM tbl_complaints c

        INNER JOIN tbl_ai_analysis ai
            ON ai.complaintID = c.complaintID

        WHERE
            UPPER(TRIM(COALESCE(c.status, 'PENDING')))
                NOT IN ('RESOLVED', 'REJECTED')

            AND UPPER(TRIM(COALESCE(c.dispatchStatus, '')))
                <> 'RESOLVED'

            AND (
                UPPER(TRIM(COALESCE(ai.urgency, ''))) = 'HIGH'

                OR (
                    c.deadlineAt IS NOT NULL
                    AND c.deadlineAt < NOW()
                )
            )

            $departmentCondition

        ORDER BY
            c.createdAt DESC,
            c.complaintID DESC

        LIMIT 50
    ";

    $stmt = $pdo->prepare($sql);
    $stmt->execute();

    $notifications = $stmt->fetchAll(PDO::FETCH_ASSOC);

    /*
    |--------------------------------------------------------------------------
    | JSON RESPONSE
    |--------------------------------------------------------------------------
    */

    echo json_encode([
        'success' => true,
        'notifications' => $notifications,
        'count' => count($notifications)
    ], JSON_UNESCAPED_UNICODE);

} catch (Throwable $e) {

    error_log(
        "Admin notification endpoint error: " . $e->getMessage()
    );

    http_response_code(500);

    echo json_encode([
        'success' => false,
        'message' => 'Unable to load notifications.'
    ], JSON_UNESCAPED_UNICODE);

}
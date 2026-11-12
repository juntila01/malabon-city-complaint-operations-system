<?php

error_reporting(E_ALL);
ini_set('display_errors', '0');

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/../db.php';


/* ============================================================
   JSON RESPONSE HELPER
============================================================ */

function jsonResponse(
    bool $success,
    string $message = '',
    array $data = [],
    int $httpCode = 200
): void {
    http_response_code($httpCode);

    echo json_encode(
        array_merge(
            [
                'success' => $success,
                'message' => $message
            ],
            $data
        ),
        JSON_UNESCAPED_SLASHES | JSON_INVALID_UTF8_SUBSTITUTE
    );

    exit;
}


/* ============================================================
   AUTHENTICATION
============================================================ */

if (
    !isset($_SESSION['logged_in']) ||
    $_SESSION['logged_in'] !== true
) {
    jsonResponse(
        false,
        'You are not logged in.',
        [],
        401
    );
}


/* ============================================================
   USER ROLE
============================================================ */

$role = strtolower(
    trim(
        (string) (
            $_SESSION['user_role']
            ?? $_SESSION['role']
            ?? $_SESSION['userType']
            ?? $_SESSION['user_type']
            ?? ''
        )
    )
);

if (!in_array($role, ['admin', 'staff'], true)) {
    jsonResponse(
        false,
        'You are not authorized to view dispatch team locations.',
        [],
        403
    );
}


/* ============================================================
   USER DEPARTMENT
============================================================ */

$department = trim(
    (string) (
        $_SESSION['department']
        ?? $_SESSION['user_department']
        ?? ''
    )
);

/*
 * Main administrator:
 * Admin account with no department or department "all".
 *
 * Department administrator/staff:
 * Can access only teams belonging to their department.
 */

$isMainAdmin = (
    $role === 'admin' &&
    (
        $department === '' ||
        strtolower($department) === 'all' ||
        strtoupper($department) === 'IT'
    )
);
if (!$isMainAdmin && $department === '') {
    jsonResponse(
        false,
        'Your account does not have a valid department.',
        [],
        403
    );
}


/* ============================================================
   GET TEAM ID
============================================================ */

$teamID = filter_input(
    INPUT_GET,
    'teamID',
    FILTER_VALIDATE_INT
);

if (
    $teamID === false ||
    $teamID === null ||
    $teamID <= 0
) {
    jsonResponse(
        false,
        'Invalid dispatch team ID.',
        [],
        400
    );
}


/* ============================================================
   LOAD DISPATCH TEAM
============================================================ */

try {

    if ($isMainAdmin) {

        /*
         * Main administrator can access all departments.
         */

        $sql = "
            SELECT
                teamID,
                teamName,
                department,
                status,
                currentLatitude,
                currentLongitude,
                locationAccuracy,
                lastLocationUpdate

            FROM tbl_dispatch_teams

            WHERE teamID = :teamID

            LIMIT 1
        ";

        $params = [
            ':teamID' => $teamID
        ];

    } else {

        /*
         * Department administrator/staff can only access
         * teams in their own department.
         */

        $sql = "
            SELECT
                teamID,
                teamName,
                department,
                status,
                currentLatitude,
                currentLongitude,
                locationAccuracy,
                lastLocationUpdate

            FROM tbl_dispatch_teams

            WHERE teamID = :teamID
              AND UPPER(TRIM(department)) = UPPER(TRIM(:department))

            LIMIT 1
        ";

        $params = [
            ':teamID' => $teamID,
            ':department' => $department
        ];
    }

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    $team = $stmt->fetch(PDO::FETCH_ASSOC);


    /* ========================================================
       TEAM NOT FOUND OR NOT AUTHORIZED
    ======================================================== */

    if (!$team) {
        jsonResponse(
            false,
            'Dispatch team not found or you are not authorized to access it.',
            [],
            404
        );
    }


    /* ========================================================
       VALIDATE COORDINATES
    ======================================================== */

    $latitude = filter_var(
        $team['currentLatitude'],
        FILTER_VALIDATE_FLOAT
    );

    $longitude = filter_var(
        $team['currentLongitude'],
        FILTER_VALIDATE_FLOAT
    );

    $hasValidLocation = (
        $team['currentLatitude'] !== null &&
        $team['currentLongitude'] !== null &&
        $team['currentLatitude'] !== '' &&
        $team['currentLongitude'] !== '' &&
        $latitude !== false &&
        $longitude !== false &&
        $latitude >= -90 &&
        $latitude <= 90 &&
        $longitude >= -180 &&
        $longitude <= 180
    );


    /* ========================================================
       NO CURRENT LOCATION
    ======================================================== */

    if (!$hasValidLocation) {
        jsonResponse(
            true,
            'Dispatch team has no valid current location.',
            [
                'active' => false,

                'team' => [
                    'teamID' => (int) $team['teamID'],
                    'teamName' => $team['teamName'],
                    'department' => $team['department'],
                    'status' => $team['status']
                ]
            ]
        );
    }


    /* ========================================================
       LOCATION ACCURACY
    ======================================================== */

    $accuracy = null;

    if (
        $team['locationAccuracy'] !== null &&
        $team['locationAccuracy'] !== ''
    ) {
        $validatedAccuracy = filter_var(
            $team['locationAccuracy'],
            FILTER_VALIDATE_FLOAT
        );

        if (
            $validatedAccuracy !== false &&
            $validatedAccuracy >= 0
        ) {
            $accuracy = (float) $validatedAccuracy;
        }
    }


    /* ========================================================
       RETURN CURRENT LOCATION
    ======================================================== */

    jsonResponse(
        true,
        'Dispatch team location loaded.',
        [
            'active' => true,

            'location' => [
                'teamID' => (int) $team['teamID'],
                'teamName' => $team['teamName'],
                'department' => $team['department'],
                'status' => $team['status'],
                'latitude' => (float) $latitude,
                'longitude' => (float) $longitude,
                'accuracy' => $accuracy,
                'lastUpdate' => $team['lastLocationUpdate']
            ]
        ]
    );

} catch (PDOException $e) {

    error_log(
        'get_dispatch_team_location.php database error: ' .
        $e->getMessage()
    );

    jsonResponse(
        false,
        'Database error while loading dispatch team location.',
        [],
        500
    );

} catch (Throwable $e) {

    error_log(
        'get_dispatch_team_location.php unexpected error: ' .
        $e->getMessage()
    );

    jsonResponse(
        false,
        'An unexpected error occurred while loading dispatch team location.',
        [],
        500
    );
}
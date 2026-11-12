
<?php

error_reporting(E_ALL);
ini_set('display_errors', '0');

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once "../db.php";

function jsonResponse(
    bool $success,
    string $message = "",
    array $data = [],
    int $httpCode = 200
): void {
    http_response_code($httpCode);

    echo json_encode(
        array_merge(
            [
                "success" => $success,
                "message" => $message
            ],
            $data
        )
    );

    exit;
}

/*
|--------------------------------------------------------------------------
| Validate citizen session
|--------------------------------------------------------------------------
*/

$citizenID =
    $_SESSION['citizenID']
    ?? $_SESSION['user_id']
    ?? null;

if (!$citizenID || !is_numeric($citizenID) || (int)$citizenID <= 0) {
    jsonResponse(
        false,
        "Citizen session is invalid.",
        [],
        401
    );
}

$citizenID = (int)$citizenID;

/*
|--------------------------------------------------------------------------
| Validate requested complaint
|--------------------------------------------------------------------------
*/

$complaintID = filter_input(
    INPUT_GET,
    'complaintID',
    FILTER_VALIDATE_INT
);

if (!$complaintID || $complaintID <= 0) {
    jsonResponse(
        false,
        "A valid complaint ID is required.",
        [],
        400
    );
}

try {

    /*
    |--------------------------------------------------------------------------
    | Get this citizen's complaint and assigned dispatch team
    |--------------------------------------------------------------------------
    */

    $sql = "
        SELECT
            c.complaintID,
            c.citizenID,
            c.dispatchTeamID,
            c.dispatchStatus,

            cl.latitude AS complaintLatitude,
            cl.longitude AS complaintLongitude,

            dt.teamID,
            dt.teamName,
            dt.department,
            dt.currentLatitude,
            dt.currentLongitude,
            dt.locationAccuracy,
            dt.lastLocationUpdate

        FROM tbl_complaints c

        LEFT JOIN tbl_complaint_locations cl
            ON cl.complaintID = c.complaintID

        LEFT JOIN tbl_dispatch_teams dt
            ON dt.teamID = c.dispatchTeamID

        WHERE
            c.complaintID = :complaintID
            AND c.citizenID = :citizenID

        LIMIT 1
    ";

    $stmt = $pdo->prepare($sql);

    $stmt->execute([
        ':complaintID' => $complaintID,
        ':citizenID' => $citizenID
    ]);

    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    /*
    |--------------------------------------------------------------------------
    | Complaint not found or does not belong to this citizen
    |--------------------------------------------------------------------------
    */

    if (!$row) {
        jsonResponse(
            false,
            "Complaint not found or access denied.",
            [],
            404
        );
    }

    /*
    |--------------------------------------------------------------------------
    | No active dispatch assignment
    |--------------------------------------------------------------------------
    */

    $activeStatuses = [
        'Assigned',
        'On the Way',
        'Arrived'
    ];

    if (
        empty($row['dispatchTeamID']) ||
        !in_array(
            trim((string)$row['dispatchStatus']),
            $activeStatuses,
            true
        ) ||
        empty($row['teamID'])
    ) {
        jsonResponse(
            true,
            "No active dispatch team assigned to this complaint.",
            [
                "active" => false,
                "complaint" => [
                    "complaintID" => (int)$row['complaintID']
                ]
            ]
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Return current dispatch location
    |--------------------------------------------------------------------------
    */

    $latitude = $row['currentLatitude'];
    $longitude = $row['currentLongitude'];

    $hasLocation =
        $latitude !== null &&
        $longitude !== null &&
        is_numeric($latitude) &&
        is_numeric($longitude) &&
        (float)$latitude >= -90 &&
        (float)$latitude <= 90 &&
        (float)$longitude >= -180 &&
        (float)$longitude <= 180;

    jsonResponse(
        true,
        $hasLocation
            ? "Dispatch location loaded."
            : "Dispatch team is assigned but has not shared a valid GPS location.",
        [
            "active" => true,

            "complaint" => [
                "complaintID" => (int)$row['complaintID'],
                "latitude" => $row['complaintLatitude'] !== null
                    ? (float)$row['complaintLatitude']
                    : null,
                "longitude" => $row['complaintLongitude'] !== null
                    ? (float)$row['complaintLongitude']
                    : null
            ],

            "dispatch" => [
                "teamID" => (int)$row['teamID'],
                "teamName" => $row['teamName'],
                "department" => $row['department'],
                "status" => $row['dispatchStatus'],
                "latitude" => $hasLocation
                    ? (float)$latitude
                    : null,
                "longitude" => $hasLocation
                    ? (float)$longitude
                    : null,
                "accuracy" => $row['locationAccuracy'] !== null
                    ? (float)$row['locationAccuracy']
                    : null,
                "lastUpdate" => $row['lastLocationUpdate']
            ]
        ]
    );

} catch (PDOException $e) {

    error_log(
        "get_dispatch_location_citizen.php: " .
        $e->getMessage()
    );

    jsonResponse(
        false,
        "Database error while loading dispatch location.",
        [],
        500
    );
}

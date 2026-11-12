<?php

session_start();

header("Content-Type: application/json");
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Pragma: no-cache");
header("Expires: 0");

require_once "../db.php";

/*
|--------------------------------------------------------------------------
| AUTHENTICATION
|--------------------------------------------------------------------------
*/

if (
    !isset($_SESSION['logged_in']) ||
    $_SESSION['logged_in'] !== true ||
    ($_SESSION['user_type'] ?? '') !== 'citizen'
) {
    http_response_code(401);

    echo json_encode([
        "success" => false,
        "message" => "You must be logged in as a citizen."
    ]);

    exit;
}

$citizenID = (int)($_SESSION['user_id'] ?? 0);

if ($citizenID <= 0) {
    http_response_code(401);

    echo json_encode([
        "success" => false,
        "message" => "Invalid citizen session."
    ]);

    exit;
}


/*
|--------------------------------------------------------------------------
| CHECK ACTIVE COMPLAINTS
|--------------------------------------------------------------------------
|
| The citizen has two independent complaint slots:
|
|   HIGH   = maximum 1 active complaint
|   NORMAL = maximum 1 active complaint
|
| Resolved and Rejected complaints are NOT active.
|
*/

try {

    /*
    |--------------------------------------------------------------------------
    | GET ACTIVE HIGH / NORMAL COMPLAINTS
    |--------------------------------------------------------------------------
    */
        $stmt = $pdo->prepare("
            SELECT
                c.complaintID,
                c.complaintReference,
                c.status,
                c.aiAnalysisStatus,
                ai.urgency,
                ai.category,
                c.createdAt

            FROM tbl_complaints c

            LEFT JOIN tbl_ai_analysis ai
                ON ai.complaintID = c.complaintID

            WHERE c.citizenID = :citizenID

            AND c.status NOT IN (
                'Resolved',
                'Rejected'
            )

            ORDER BY c.complaintID DESC
        ");

    $stmt->execute([
        ":citizenID" => $citizenID
    ]);

    $complaints = $stmt->fetchAll(PDO::FETCH_ASSOC);


    /*
    |--------------------------------------------------------------------------
    | COUNT EACH URGENCY TYPE
    |--------------------------------------------------------------------------
    */

    
    $highComplaints = [];
    $normalComplaints = [];
    $manualReviewComplaints = [];

    foreach ($complaints as $complaint) {

        $urgency = strtoupper(
            trim($complaint['urgency'] ?? '')
        );

        $requiresManualReview =
            ($complaint['aiAnalysisStatus'] ?? '') === 'Unavailable';

        if ($requiresManualReview) {

            $manualReviewComplaints[] = $complaint;

        } elseif ($urgency === 'HIGH') {

            $highComplaints[] = $complaint;

        } elseif ($urgency === 'NORMAL') {

            $normalComplaints[] = $complaint;
        }
    }



    /*
    |--------------------------------------------------------------------------
    | COUNTS
    |--------------------------------------------------------------------------
    */

    $highCount = count($highComplaints);
    $normalCount = count($normalComplaints);
    $manualReviewCount = count($manualReviewComplaints);


    /*
    |--------------------------------------------------------------------------
    | SLOT AVAILABILITY
    |--------------------------------------------------------------------------
    */

    $highActive = $highCount > 0;
    $normalActive = $normalCount > 0;

    $highAvailable = $highCount < 1;
    $normalAvailable = $normalCount < 1;


    /*
    |--------------------------------------------------------------------------
    | BOTH SLOTS FULL
    |--------------------------------------------------------------------------
    */

    $limitReached =
    $manualReviewCount > 0 ||
    ($highActive && $normalActive);


    /*
    |--------------------------------------------------------------------------
    | RESPONSE
    |--------------------------------------------------------------------------
    */

    echo json_encode([
        "success" => true,

        "citizenID" => $citizenID,

        "highActive" => $highActive,
        "normalActive" => $normalActive,

        "highCount" => $highCount,
        "normalCount" => $normalCount,

        "highAvailable" => $highAvailable,
        "normalAvailable" => $normalAvailable,

        "limitReached" => $limitReached,

        "manualReviewActive" => $manualReviewCount > 0,
        "manualReviewCount" => $manualReviewCount,
        "manualReviewComplaints" => $manualReviewComplaints,

        /*
        |----------------------------------------------------------------------
        | Useful for testing
        |----------------------------------------------------------------------
        */

        "activeComplaints" => $complaints
    ]);

    exit;


} catch (Throwable $e) {

    error_log(
        "get_complaint_status.php error: " .
        $e->getMessage()
    );

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Unable to check complaint status."
    ]);

    exit;
}
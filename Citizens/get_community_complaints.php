<?php

header("Content-Type: application/json");

require_once "../db.php";

try {

    /* =========================================================
    INPUT
    ========================================================= */

    $complaintID = isset($_GET['id'])
        ? (int)$_GET['id']
        : null;

    /* =========================================================
       PAGINATION
    ========================================================= */

    $limit = isset($_GET['limit'])
        ? (int)$_GET['limit']
        : 10;

    if ($limit < 1) {
        $limit = 10;
    }

    if ($limit > 30) {
        $limit = 30;
    }
/* =========================================================
   MAIN QUERY
========================================================= */

$sql = "

    SELECT

        /* =================================================
           COMPLAINT
        ================================================= */

        c.complaintID,
        c.citizenID,
        c.rawComplaintText,
        c.status,
        c.createdAt,


        /* =================================================
           CITIZEN
        ================================================= */

        cit.fullName AS citizenName,


        /* =================================================
           AI ANALYSIS
        ================================================= */

        ai.category AS aiCategory,
        ai.urgency AS aiUrgency,
        ai.location AS aiLocation,
        ai.summary AS aiSummary,
        ai.confidence AS aiConfidence,


        /* =================================================
           LATEST ATTACHMENT
        ================================================= */

        (
            SELECT a.attachmentID
            FROM tbl_attachments a
            WHERE a.complaintID = c.complaintID
            ORDER BY a.uploadedAt DESC
            LIMIT 1
        ) AS attachmentID,

        (
            SELECT a.fileName
            FROM tbl_attachments a
            WHERE a.complaintID = c.complaintID
            ORDER BY a.uploadedAt DESC
            LIMIT 1
        ) AS fileName,

        (
            SELECT a.filePath
            FROM tbl_attachments a
            WHERE a.complaintID = c.complaintID
            ORDER BY a.uploadedAt DESC
            LIMIT 1
        ) AS filePath,

        (
            SELECT a.fileType
            FROM tbl_attachments a
            WHERE a.complaintID = c.complaintID
            ORDER BY a.uploadedAt DESC
            LIMIT 1
        ) AS fileType,

        (
            SELECT a.uploadedAt
            FROM tbl_attachments a
            WHERE a.complaintID = c.complaintID
            ORDER BY a.uploadedAt DESC
            LIMIT 1
        ) AS uploadedAt,


        /* =================================================
           LATEST GPS LOCATION
        ================================================= */

        (
            SELECT l.latitude
            FROM tbl_complaint_locations l
            WHERE l.complaintID = c.complaintID
            ORDER BY l.recordedAt DESC
            LIMIT 1
        ) AS latitude,

        (
            SELECT l.longitude
            FROM tbl_complaint_locations l
            WHERE l.complaintID = c.complaintID
            ORDER BY l.recordedAt DESC
            LIMIT 1
        ) AS longitude,

        (
            SELECT l.accuracy
            FROM tbl_complaint_locations l
            WHERE l.complaintID = c.complaintID
            ORDER BY l.recordedAt DESC
            LIMIT 1
        ) AS accuracy,

        (
            SELECT l.recordedAt
            FROM tbl_complaint_locations l
            WHERE l.complaintID = c.complaintID
            ORDER BY l.recordedAt DESC
            LIMIT 1
        ) AS recordedAt


    FROM tbl_complaints c


    LEFT JOIN tbl_ai_analysis ai
        ON ai.complaintID = c.complaintID


    LEFT JOIN tbl_citizens cit
        ON cit.citizenID = c.citizenID


    WHERE c.status <> 'Rejected'

";


/* =========================================================
   SPECIFIC COMPLAINT
========================================================= */

if ($complaintID !== null) {

    $sql .= "
        AND c.complaintID = :complaintID
    ";

}


/* =========================================================
   ORDER
========================================================= */

$sql .= "

    ORDER BY c.createdAt DESC

";


/* =========================================================
   PAGINATION
========================================================= */

if ($complaintID === null) {

    $sql .= "
        LIMIT {$limit}
    ";

}


/* =========================================================
   EXECUTE QUERY
========================================================= */

$stmt = $pdo->prepare($sql);


if ($complaintID !== null) {

    $stmt->bindValue(
        ":complaintID",
        $complaintID,
        PDO::PARAM_INT
    );

}


$stmt->execute();

$complaints = $stmt->fetchAll(PDO::FETCH_ASSOC);


    /* =========================================================
       PROCESS RESULTS
    ========================================================= */

    foreach ($complaints as &$complaint) {


        /* =====================================================
           FILE PATH
        ===================================================== */

        if (!empty($complaint['filePath'])) {

            $filePath = ltrim(
                $complaint['filePath'],
                '/'
            );

            if (strpos($filePath, 'Complaint/') === 0) {

                $complaint['filePath'] =
                    '/' . $filePath;

            } else {

                $complaint['filePath'] =
                    '/Complaint/' . $filePath;

            }

        } else {

            $complaint['filePath'] = '';

        }


        /* =====================================================
           NORMALIZE AI VALUES
        ===================================================== */

        $complaint['aiCategory'] =
            trim((string)($complaint['aiCategory'] ?? ''));

        $complaint['aiUrgency'] =
            trim((string)($complaint['aiUrgency'] ?? ''));

        $complaint['aiLocation'] =
            trim((string)($complaint['aiLocation'] ?? ''));

        $complaint['aiSummary'] =
            trim((string)($complaint['aiSummary'] ?? ''));


        /* =====================================================
           GPS VALIDATION
        ===================================================== */

        $latitude = $complaint['latitude'];
        $longitude = $complaint['longitude'];


        if (
            $latitude !== null &&
            $longitude !== null &&
            $latitude !== '' &&
            $longitude !== ''
        ) {

            $complaint['hasLocation'] = true;

            $complaint['latitude'] =
                (float)$latitude;

            $complaint['longitude'] =
                (float)$longitude;

            if (
                $complaint['accuracy'] !== null &&
                $complaint['accuracy'] !== ''
            ) {

                $complaint['accuracy'] =
                    (float)$complaint['accuracy'];

            }

        } else {

            $complaint['hasLocation'] = false;

            $complaint['latitude'] = null;
            $complaint['longitude'] = null;
            $complaint['accuracy'] = null;

        }


        /* =====================================================
           IMPORTANT:
           DO NOT USE ai.location AS THE GPS LANDMARK
           
           The actual nearby landmark is determined from the
           GPS coordinates on the client side using the same
           Google Places logic used by My Complaints.
        ===================================================== */

        $complaint['nearbyLandmark'] = '';


        /* =====================================================
           OPTIONAL FALLBACK
           
           If AI itself contains a legitimate location, expose
           it separately. This is NOT treated as the GPS landmark.
        ===================================================== */

        $invalidLocations = [
            '',
            'unknown',
            'unknown location',
            'n/a',
            'na',
            'none',
            'not available',
            'not detected',
            'null'
        ];

        if (
            !in_array(
                strtolower($complaint['aiLocation']),
                $invalidLocations,
                true
            )
        ) {

            $complaint['aiLocationAvailable'] = true;

        } else {

            $complaint['aiLocationAvailable'] = false;

        }


        /* =====================================================
           ATTACHMENT FLAG
        ===================================================== */

        $complaint['hasAttachment'] =
            !empty($complaint['attachmentID']);

    }

    unset($complaint);


    /* =========================================================
       RESPONSE
    ========================================================= */

    echo json_encode([

        "success" => true,

        "data" => $complaints,

        "count" => count($complaints)

    ], JSON_UNESCAPED_UNICODE);


}


/* =============================================================
   DATABASE ERROR
============================================================= */

catch (PDOException $e) {

    http_response_code(500);

    echo json_encode([

        "success" => false,

        "message" => "Database error.",

        "error" => $e->getMessage()

    ]);

}


/* =============================================================
   GENERAL ERROR
============================================================= */

catch (Throwable $e) {

    http_response_code(500);

    echo json_encode([

        "success" => false,

        "message" => "Server error.",

        "error" => $e->getMessage()

    ]);

}

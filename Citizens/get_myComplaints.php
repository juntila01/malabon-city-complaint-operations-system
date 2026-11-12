<?php

header("Content-Type: application/json");

session_start();

require_once "../db.php";

try {

    // ==========================================
    // CHECK CITIZEN LOGIN
    // ==========================================

    if (
        !isset($_SESSION['logged_in']) ||
        $_SESSION['logged_in'] !== true ||
        !isset($_SESSION['user_type']) ||
        $_SESSION['user_type'] !== 'citizen' ||
        !isset($_SESSION['user_id'])
    ) {

        http_response_code(401);

        echo json_encode([
            "success" => false,
            "message" => "User is not logged in."
        ]);

        exit;
    }


    // ==========================================
    // GET LOGGED-IN CITIZEN ID
    // ==========================================

    $citizenID = (int) $_SESSION['user_id'];


    // ==========================================
    // GET CITIZEN'S COMPLAINTS
    // + LATEST AI ANALYSIS
    // + LOCATION
    // + ATTACHMENT
    // ==========================================

    $sql = "

        SELECT

            /* ==================================
               COMPLAINT
               ================================== */

            c.complaintID,
            c.citizenID,
            c.rawComplaintText,
            c.status,
            c.dispatchStatus,
            c.createdAt,

            /* ==================================
               SLA
               ================================== */

            c.deadlineAt,
            c.firstResponseAt,
            c.completedAt,
            c.slaStatus,

            /* ==================================
                FEEDBACK STATUS
                ================================== */

                CASE
                    WHEN EXISTS (
                        SELECT 1
                        FROM tbl_feedback f
                        WHERE f.complaintID = c.complaintID
                    )
                    THEN 1
                    ELSE 0
                END AS hasFeedback,


            /* ==================================
               AI ANALYSIS
               ================================== */

            ai.analysisID,

            ai.category AS aiCategory,

            ai.urgency AS aiUrgency,

            ai.location AS aiLocation,

            ai.summary AS aiSummary,

            ai.confidence AS aiConfidence,

            ai.containsProfanity,

            ai.imageAnalysis,

            ai.imageMatch,

            ai.imageMatchConfidence,

            ai.verificationFlag,

            ai.analyzedAt,


            /* ==================================
               GPS LOCATION
               ================================== */

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
            ) AS locationRecordedAt,


            /* ==================================
               MOST RECENT ATTACHMENT
               ================================== */

            /* ==================================
   MOST RECENT ATTACHMENT
   ================================== */

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
) AS uploadedAt


        FROM tbl_complaints c


        /* ======================================
           LATEST AI ANALYSIS FOR EACH COMPLAINT
           ====================================== */

        LEFT JOIN tbl_ai_analysis ai

            ON ai.analysisID = (

                SELECT ai2.analysisID

                FROM tbl_ai_analysis ai2

                WHERE ai2.complaintID = c.complaintID

                ORDER BY
                    ai2.analyzedAt DESC,
                    ai2.analysisID DESC

                LIMIT 1
            )


        /* ======================================
           ONLY LOGGED-IN CITIZEN'S COMPLAINTS
           ====================================== */

        WHERE c.citizenID = :citizenID


        ORDER BY
            c.createdAt DESC,
            c.complaintID DESC

    ";


    $stmt = $pdo->prepare($sql);

    $stmt->execute([
        ":citizenID" => $citizenID
    ]);


    $complaints = $stmt->fetchAll(PDO::FETCH_ASSOC);


    // ==========================================
// FIX ATTACHMENT PATH
// ==========================================

foreach ($complaints as &$complaint) {

    if (!empty($complaint["filePath"])) {

        $filePath = trim($complaint["filePath"]);

        /*
         * Already a browser URL
         */
        if (strpos($filePath, "/Complaint/") === 0) {

            $complaint["filePath"] = $filePath;

        }

        /*
         * Resolution evidence
         */
        elseif (
            strpos($filePath, "uploads/resolutions/") === 0
        ) {

            $filename = basename($filePath);

            $complaint["filePath"] =
                "/Complaint/uploads/resolutions/" . $filename;

        }

        /*
         * Normal complaint attachment
         */
        else {

            $filename = basename($filePath);

            $complaint["filePath"] =
                "/Complaint/uploads/" . $filename;

        }

    }

}

unset($complaint);


    // ==========================================
    // RETURN RESULT
    // ==========================================

    echo json_encode([

        "success" => true,

        "count" => count($complaints),

        "data" => $complaints

    ]);

}


catch (PDOException $e) {

    http_response_code(500);

    echo json_encode([

        "success" => false,

        "message" => "Database error.",

        "error" => $e->getMessage()

    ]);

}
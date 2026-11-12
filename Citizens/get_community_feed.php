<?php

header("Content-Type: application/json");

require_once "../db.php";

try {

    $stmt = $pdo->query("

                SELECT

            c.complaintID,

            c.rawComplaintText,

            ai.category AS aiCategory,

            ai.urgency AS aiUrgency,

            ai.location AS aiLocation,

            ai.summary AS aiSummary,

            ai.confidence AS aiConfidence,

            ai.imageMatch,

            ai.imageMatchConfidence,

            ai.verificationFlag,

            c.status,

            c.createdAt,

            a.filePath,

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
            ) AS accuracy


        FROM tbl_complaints c

        LEFT JOIN tbl_ai_analysis ai
            ON c.complaintID = ai.complaintID

        LEFT JOIN tbl_attachments a
            ON c.complaintID = a.complaintID

        WHERE c.status != 'Rejected'

        ORDER BY c.createdAt DESC

    ");

    echo json_encode([

        "success" => true,

        "data" =>
            $stmt->fetchAll(PDO::FETCH_ASSOC)

    ]);

} catch (PDOException $e) {

    http_response_code(500);

    echo json_encode([

        "success" => false,

        "message" => $e->getMessage()

    ]);

}
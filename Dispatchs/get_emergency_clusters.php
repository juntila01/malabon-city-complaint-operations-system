    <?php

    session_start();

    header("Content-Type: application/json");

    require_once "../db.php";

    // ============================================================
    // CHECK LOGIN
    // ============================================================

    if (
        !isset($_SESSION['logged_in']) ||
        $_SESSION['logged_in'] !== true
    ) {
        echo json_encode([
            "success" => false,
            "message" => "You are not logged in."
        ]);
        exit;
    }

    // ============================================================
    // GET EMERGENCY CLUSTERS
    // ============================================================

    try {

        $stmt = $pdo->prepare("
            SELECT
                ec.clusterID,
                ec.clusterReference,
                ec.category,
                ec.severity,
                ec.latitude,
                ec.longitude,
                ec.representativeComplaintID,
                rc.dispatchStatus AS representativeDispatchStatus,
                ec.dispatchTeamID,
                ec.status,
                ec.createdAt,
                ec.dispatchedAt,
                ec.resolvedAt,

                dt.teamName,
                dt.department,

                COUNT(DISTINCT ecc.complaintID) AS complaintCount,

                GROUP_CONCAT(
                    DISTINCT ecc.complaintID
                    ORDER BY ecc.complaintID
                ) AS complaintIDs,

                SUM(
                    CASE
                        WHEN ai.urgency = 'HIGH'
                        THEN 1
                        ELSE 0
                    END
                ) AS highUrgencyCount

            FROM tbl_emergency_clusters ec

            LEFT JOIN tbl_complaints rc
        ON rc.complaintID = ec.representativeComplaintID

            LEFT JOIN tbl_emergency_cluster_complaints ecc
                ON ecc.clusterID = ec.clusterID

            LEFT JOIN tbl_ai_analysis ai
                ON ai.complaintID = ecc.complaintID

            LEFT JOIN tbl_dispatch_teams dt
                ON dt.teamID = ec.dispatchTeamID

            WHERE ec.status NOT IN (
                'Resolved',
                'Unable to Resolve'
            )

            GROUP BY
                ec.clusterID,
                ec.clusterReference,
                ec.category,
                ec.severity,
                ec.latitude,
                ec.longitude,
                ec.representativeComplaintID,
                ec.dispatchTeamID,
                ec.status,
                ec.createdAt,
                ec.dispatchedAt,
                ec.resolvedAt,
                dt.teamName,
                dt.department,
                rc.dispatchStatus

            ORDER BY
                ec.createdAt DESC
        ");

        $stmt->execute();

        $clusters =
            $stmt->fetchAll(PDO::FETCH_ASSOC);

        // ========================================================
        // FORMAT COUNTS
        // ========================================================

        foreach ($clusters as &$cluster) {

            $cluster["clusterID"] =
                (int) $cluster["clusterID"];

            $cluster["representativeComplaintID"] =
                (int) $cluster["representativeComplaintID"];

            $cluster["dispatchTeamID"] =
                $cluster["dispatchTeamID"] !== null
                    ? (int) $cluster["dispatchTeamID"]
                    : null;

            $cluster["complaintCount"] =
                (int) $cluster["complaintCount"];

            $cluster["complaintIDs"] =
                !empty($cluster["complaintIDs"])
                    ? array_map(
                        "intval",
                        explode(",", $cluster["complaintIDs"])
                    )
                    : [];

            $cluster["highUrgencyCount"] =
                (int) $cluster["highUrgencyCount"];

            $cluster["latitude"] =
                (float) $cluster["latitude"];

            $cluster["longitude"] =
                (float) $cluster["longitude"];
        }

        unset($cluster);

        // ========================================================
        // RESPONSE
        // ========================================================

        echo json_encode([
            "success" => true,
            "data" => $clusters
        ]);

    }
    catch (PDOException $e) {

        http_response_code(500);

        echo json_encode([
            "success" => false,
            "message" =>
                "Unable to load emergency incidents.",
            "error" =>
                $e->getMessage()
        ]);
    }


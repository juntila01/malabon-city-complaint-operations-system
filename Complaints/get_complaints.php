<?php

header("Content-Type: application/json");

session_start();

require_once "../db.php";


try {

    /* =========================================================
       CHECK LOGIN
    ========================================================= */

    if (
        !isset($_SESSION['logged_in']) ||
        $_SESSION['logged_in'] !== true
    ) {

        http_response_code(401);

        echo json_encode([
            "success" => false,
            "message" => "You are not logged in."
        ]);

        exit;
    }


    /* =========================================================
       CHECK SYSTEM USER
    ========================================================= */

    if (
        !isset($_SESSION['user_type']) ||
        $_SESSION['user_type'] !== 'system'
    ) {

        http_response_code(403);

        echo json_encode([
            "success" => false,
            "message" => "Only system users can access complaints."
        ]);

        exit;
    }


    /* =========================================================
       CHECK USER ROLE
    =========================================================
    
       Both ADMIN and STAFF can access complaints.
    
       This does NOT give STAFF permission to:
       - add system users
       - manage dispatch teams
       - change team settings
    
       Those permissions remain controlled by their
       respective endpoints.
    
    ========================================================= */

    $userRole =
        strtolower(
            trim(
                $_SESSION['user_role'] ?? ''
            )
        );


    if (
        $userRole !== 'admin' &&
        $userRole !== 'staff'
    ) {

        http_response_code(403);

        echo json_encode([
            "success" => false,
            "message" => "Only admin and staff users can access complaints."
        ]);

        exit;
    }


    /* =========================================================
       INPUT
    ========================================================= */

    $search =
        trim(
            $_GET['search'] ?? ''
        );

    $category =
        trim(
            $_GET['category'] ?? ''
        );

    $status =
        trim(
            $_GET['status'] ?? ''
        );

    $urgency =
        trim(
            $_GET['urgency'] ?? ''
        );

    $assignment =
        trim(
            $_GET['assignment'] ?? ''
        );


    /* =========================================================
       CLEAN INPUT
    ========================================================= */

    if ($category === 'undefined') {
        $category = '';
    }

    if ($status === 'undefined') {
        $status = '';
    }

    if ($urgency === 'undefined') {
        $urgency = '';
    }

    if ($assignment === 'undefined') {
        $assignment = '';
    }


    /* =========================================================
       PENDING DASHBOARD MODE
    ========================================================= */

    $pendingDashboardMode =
        isset($_GET['pendingMode']) &&
        $_GET['pendingMode'] === '1';


    /* =========================================================
       PAGINATION
    ========================================================= */

    $page =
        isset($_GET['page'])
            ? max(
                1,
                (int) $_GET['page']
            )
            : 1;


    $limit =
        isset($_GET['limit'])
            ? (int) $_GET['limit']
            : 10;


    if ($limit < 1) {
        $limit = 10;
    }

    if ($limit > 50) {
        $limit = 50;
    }


    $offset =
        ($page - 1) * $limit;


    /* =========================================================
       BASE WHERE
    ========================================================= */

    $where = [];

    $params = [];


    /* =========================================================
       DEPARTMENT ACCESS FILTER
    ========================================================= */

    $userDepartment =
        strtoupper(
            trim(
                $_SESSION['department'] ?? ''
            )
        );


    /*
     * IT has access to ALL complaints.
     */

    if (
        $userDepartment !== 'IT'
    ) {

        /* =====================================================
           BFP
           ===================================================== */

        if (
            $userDepartment === 'BFP'
        ) {

            /*
             * BFP handles:
             *
             * Fire - ALL
             * Flood - HIGH
             */

            $where[] = "
                (
                    UPPER(ai.category) = 'FIRE'

                    OR

                    (
                        UPPER(ai.category) = 'FLOOD'
                        AND UPPER(ai.urgency) = 'HIGH'
                    )
                )
            ";

        }


        /* =====================================================
           MCAT
           ===================================================== */

        elseif (
            $userDepartment === 'MCAT'
        ) {

            /*
             * MCAT handles:
             *
             * Obstruction - ALL
             * Flood - NORMAL
             */

            $where[] = "
                (
                    UPPER(ai.category) = 'OBSTRUCTION'

                    OR

                    (
                        UPPER(ai.category) = 'FLOOD'
                        AND UPPER(ai.urgency) = 'NORMAL'
                    )
                )
            ";

        }


        /* =====================================================
           PSTMO
           ===================================================== */

        elseif (
            $userDepartment === 'PSTMO'
        ) {

            /*
             * PSTMO handles:
             *
             * Traffic - ALL
             */

            $where[] = "
                UPPER(ai.category) = 'TRAFFIC'
            ";

        }


        /* =====================================================
        UNKNOWN / UNASSIGNED DEPARTMENT
        ===================================================== */

        else {

            /*
            * A global administrator with no department
            * can access complaints awaiting manual AI review.
            *
            * Other unrecognized departments remain blocked.
            */

            if (
                $userRole === 'admin' &&
                $userDepartment === ''
            ) {

                $where[] = "
                    c.aiAnalysisStatus = 'Unavailable'
                ";

            }
            else {

                $where[] = "1 = 0";

            }

        }

    }


    /* =========================================================
       CATEGORY FILTER
    ========================================================= */

    if (
        $category !== ''
    ) {

        $where[] = "
            (
                ai.category = :category
                OR c.aiAnalysisStatus = 'Unavailable'
            )
        ";

        $params[':category'] = $category;

    }


    /* =========================================================
       SEARCH FILTER
    ========================================================= */

    if (
        $search !== ''
    ) {

        $where[] = "
            (
                CAST(c.complaintID AS CHAR) LIKE :search

                OR c.complaintReference LIKE :search

                OR c.rawComplaintText LIKE :search

                OR cit.fullName LIKE :search

                OR ai.category LIKE :search

                OR ai.location LIKE :search

                OR ai.urgency LIKE :search

                OR c.status LIKE :search

                OR staff.name LIKE :search

                OR dt.teamName LIKE :search
            )
        ";

        $params[':search'] =
            "%{$search}%";

    }


    /* =========================================================
       STATUS FILTER
    ========================================================= */

    if (
        $pendingDashboardMode
    ) {

        /*
         * Dashboard Pending Complaints includes
         * BOTH pending and awaiting complaints.
         */

        $where[] = "
            LOWER(c.status)
            IN ('pending', 'awaiting')
        ";

    }

    elseif (
        $status !== ''
    ) {

        $where[] =
            "c.status = :status";

        $params[':status'] =
            $status;

    }


    /* =========================================================
       URGENCY FILTER
    ========================================================= */

    if (
        $urgency !== ''
    ) {

        $where[] = "
            (
                ai.urgency = :urgency
                OR c.aiAnalysisStatus = 'Unavailable'
            )
        ";

        $params[':urgency'] = $urgency;

    }


    /* =========================================================
       ASSIGNMENT FILTER
    =========================================================
    
       IMPORTANT:
    
       A complaint can be assigned either to:
    
       1. A system staff member
       2. A dispatch team
    
       Therefore we check BOTH assignedStaffID and
       dispatchTeamID.
    
    ========================================================= */

    if (
        $assignment === 'assigned'
    ) {

        $where[] = "
            (
                c.assignedStaffID IS NOT NULL

                OR

                c.dispatchTeamID IS NOT NULL
            )
        ";

    }

    elseif (
        $assignment === 'unassigned'
    ) {

        $where[] = "
            (
                c.assignedStaffID IS NULL

                AND

                c.dispatchTeamID IS NULL
            )
        ";

    }


    /* =========================================================
       BUILD WHERE CLAUSE
    ========================================================= */

    $whereSQL = "";

    if (
        !empty($where)
    ) {

        $whereSQL =
            " WHERE " .
            implode(
                " AND ",
                $where
            );

    }


    /* =========================================================
       COUNT TOTAL COMPLAINTS
    ========================================================= */

    $countSQL = "

        SELECT COUNT(*)

        FROM tbl_complaints c

        LEFT JOIN tbl_ai_analysis ai
            ON ai.complaintID = c.complaintID

        LEFT JOIN tbl_citizens cit
            ON cit.citizenID = c.citizenID

        LEFT JOIN tbl_systemusers staff
            ON staff.systemUsersID = c.assignedStaffID

        LEFT JOIN tbl_dispatch_teams dt
            ON dt.teamID = c.dispatchTeamID

        {$whereSQL}

    ";


    $countStmt =
        $pdo->prepare(
            $countSQL
        );


    foreach (
        $params
        as $key => $value
    ) {

        $countStmt->bindValue(
            $key,
            $value,
            PDO::PARAM_STR
        );

    }


    $countStmt->execute();


    $total =
        (int)
        $countStmt->fetchColumn();


    /* =========================================================
       CALCULATE TOTAL PAGES
    ========================================================= */

    $totalPages =
        $total > 0
            ? (int)
                ceil(
                    $total / $limit
                )
            : 1;


    if (
        $page > $totalPages
    ) {

        $page =
            $totalPages;

        $offset =
            ($page - 1) * $limit;

    }


    /* =========================================================
       SORTING
    ========================================================= */

    if (
        $pendingDashboardMode
    ) {

        $orderSQL = "

            ORDER BY

                c.createdAt ASC,

                c.complaintID ASC

        ";

    }

    else {

        $orderSQL = "

            ORDER BY

                /* =================================================
                   ACTIVE COMPLAINTS FIRST
                ================================================= */

                CASE

                    WHEN LOWER(c.status)
                        IN ('resolved', 'rejected')

                    THEN 2

                    ELSE 1

                END ASC,


                /* =================================================
                   URGENCY
                   HIGH → NORMAL → LOW
                ================================================= */

                CASE

                    WHEN UPPER(ai.urgency) = 'HIGH'
                        THEN 1

                    WHEN UPPER(ai.urgency) = 'NORMAL'
                        THEN 2

                    WHEN UPPER(ai.urgency) = 'LOW'
                        THEN 3

                    ELSE 4

                END ASC,


                /* =================================================
                   EARLIER DEADLINES FIRST
                ================================================= */

                CASE

                    WHEN LOWER(c.status)
                        NOT IN ('resolved', 'rejected')

                    THEN c.deadlineAt

                    ELSE NULL

                END ASC,


                /* =================================================
                   NEWEST COMPLETED COMPLAINTS FIRST
                ================================================= */

                CASE

                    WHEN LOWER(c.status)
                        IN ('resolved', 'rejected')

                    THEN c.completedAt

                    ELSE NULL

                END DESC,


                /* =================================================
                   FINAL TIE BREAKER
                ================================================= */

                c.createdAt DESC

        ";

    }


    /* =========================================================
       MAIN QUERY
    ========================================================= */

    $sql = "

        SELECT

            /* =================================================
               COMPLAINT DATA
            ================================================= */

            c.complaintID,

            c.complaintReference,

            c.citizenID,

            c.assignedStaffID,

            staff.name AS assignedStaffName,

            c.dispatchTeamID,

            dt.teamName AS dispatchTeamName,

            dt.department AS dispatchTeamDepartment,

            c.dispatchStatus,

            c.assignedAt,

            c.onTheWayAt,

            c.arrivedAt,

            c.rawComplaintText,

            c.status,

            c.aiAnalysisStatus,

            c.createdAt,

            c.deadlineAt,

            c.firstResponseAt,

            c.completedAt,

            c.slaStatus,


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

            ai.containsProfanity AS aiContainsProfanity,

            ai.imageAnalysis AS aiImageAnalysis,

            ai.imageMatch AS aiImageMatch,

            ai.imageMatchConfidence AS aiImageMatchConfidence,

            ai.verificationFlag AS aiVerificationFlag,

            ai.analyzedAt AS aiAnalyzedAt,


            /* =================================================
               LATEST ATTACHMENT
            ================================================= */

            (
                SELECT
                    a.attachmentID

                FROM tbl_attachments a

                WHERE
                    a.complaintID = c.complaintID

                ORDER BY
                    a.uploadedAt DESC

                LIMIT 1

            ) AS attachmentID,


            (
                SELECT
                    a.fileName

                FROM tbl_attachments a

                WHERE
                    a.complaintID = c.complaintID

                ORDER BY
                    a.uploadedAt DESC

                LIMIT 1

            ) AS fileName,


            (
                SELECT
                    a.filePath

                FROM tbl_attachments a

                WHERE
                    a.complaintID = c.complaintID

                ORDER BY
                    a.uploadedAt DESC

                LIMIT 1

            ) AS filePath,


            (
                SELECT
                    a.fileType

                FROM tbl_attachments a

                WHERE
                    a.complaintID = c.complaintID

                ORDER BY
                    a.uploadedAt DESC

                LIMIT 1

            ) AS fileType,


            (
                SELECT
                    a.uploadedAt

                FROM tbl_attachments a

                WHERE
                    a.complaintID = c.complaintID

                ORDER BY
                    a.uploadedAt DESC

                LIMIT 1

            ) AS uploadedAt,


            /* =================================================
               LATEST GPS LOCATION
            ================================================= */

            (
                SELECT
                    l.complaintLocationID

                FROM tbl_complaint_locations l

                WHERE
                    l.complaintID = c.complaintID

                ORDER BY
                    l.recordedAt DESC

                LIMIT 1

            ) AS complaintLocationID,


            (
                SELECT
                    l.latitude

                FROM tbl_complaint_locations l

                WHERE
                    l.complaintID = c.complaintID

                ORDER BY
                    l.recordedAt DESC

                LIMIT 1

            ) AS latitude,


            (
                SELECT
                    l.longitude

                FROM tbl_complaint_locations l

                WHERE
                    l.complaintID = c.complaintID

                ORDER BY
                    l.recordedAt DESC

                LIMIT 1

            ) AS longitude,


            (
                SELECT
                    l.accuracy

                FROM tbl_complaint_locations l

                WHERE
                    l.complaintID = c.complaintID

                ORDER BY
                    l.recordedAt DESC

                LIMIT 1

            ) AS accuracy,


            (
                SELECT
                    l.recordedAt

                FROM tbl_complaint_locations l

                WHERE
                    l.complaintID = c.complaintID

                ORDER BY
                    l.recordedAt DESC

                LIMIT 1

            ) AS recordedAt


        FROM tbl_complaints c


        /* =====================================================
           AI ANALYSIS JOIN
        ===================================================== */

        LEFT JOIN tbl_ai_analysis ai

            ON ai.complaintID =
               c.complaintID


        /* =====================================================
           CITIZEN JOIN
        ===================================================== */

        LEFT JOIN tbl_citizens cit

            ON cit.citizenID =
               c.citizenID


        /* =====================================================
           STAFF JOIN
        ===================================================== */

        LEFT JOIN tbl_systemusers staff

            ON staff.systemUsersID =
               c.assignedStaffID


        /* =====================================================
           DISPATCH TEAM JOIN
        ===================================================== */

        LEFT JOIN tbl_dispatch_teams dt

            ON dt.teamID =
               c.dispatchTeamID


        {$whereSQL}


        {$orderSQL}


        LIMIT {$limit}

        OFFSET {$offset}

    ";


    /* =========================================================
       EXECUTE MAIN QUERY
    ========================================================= */

    $stmt =
        $pdo->prepare(
            $sql
        );


    foreach (
        $params
        as $key => $value
    ) {

        $stmt->bindValue(
            $key,
            $value,
            PDO::PARAM_STR
        );

    }


    $stmt->execute();


    $complaints =
        $stmt->fetchAll(
            PDO::FETCH_ASSOC
        );


    /* =========================================================
       PROCESS RESULTS
    ========================================================= */

    foreach (
        $complaints
        as &$complaint
    ) {
        
        /* =====================================================
        MANUAL AI REVIEW STATUS
        ===================================================== */

        $complaint['requiresManualReview'] =
            (
                ($complaint['aiAnalysisStatus'] ?? '')
                === 'Unavailable'
            );


        /* =====================================================
           FILE PATH
        ===================================================== */

        if (
            !empty(
                $complaint['filePath']
            )
        ) {

            $filePath =
                ltrim(
                    $complaint['filePath'],
                    '/'
                );


            if (
                strpos(
                    $filePath,
                    'Complaint/'
                ) === 0
            ) {

                $complaint['filePath'] =
                    '/' . $filePath;

            }
            else {

                $complaint['filePath'] =
                    '/Complaint/' .
                    $filePath;

            }

        }


        /* =====================================================
           LOCATION VALIDATION
        ===================================================== */

        if (
            $complaint['latitude'] !== null &&
            $complaint['longitude'] !== null
        ) {

            $complaint['hasLocation'] =
                true;

        }
        else {

            $complaint['hasLocation'] =
                false;

        }


        /* =====================================================
           IMAGE VERIFICATION STATUS
        ===================================================== */

        if (
            !empty(
                $complaint['aiImageMatch']
            )
        ) {

            $complaint[
                'imageVerificationAvailable'
            ] = true;

        }
        else {

            $complaint[
                'imageVerificationAvailable'
            ] = false;

        }


        /* =====================================================
           DISPATCH ASSIGNMENT STATUS
        =====================================================
        
           This is separate from assignedStaffID.
        
           A complaint is considered assigned if either:
        
           - a system staff member is assigned
           - a dispatch team is assigned
        
        ===================================================== */

        $hasStaffAssignment =
            !empty(
                $complaint['assignedStaffID']
            );


        $hasDispatchAssignment =
            !empty(
                $complaint['dispatchTeamID']
            );


        $complaint['isAssigned'] =
            (
                $hasStaffAssignment ||
                $hasDispatchAssignment
            );


        /* =====================================================
           NORMALIZED DISPATCH DATA
        ===================================================== */

        $complaint['dispatchTeamID'] =
            !empty(
                $complaint['dispatchTeamID']
            )
                ? (int)
                    $complaint['dispatchTeamID']
                : null;


        $complaint['assignedStaffID'] =
            !empty(
                $complaint['assignedStaffID']
            )
                ? (int)
                    $complaint['assignedStaffID']
                : null;

    }

    unset($complaint);


    /* =========================================================
       PAGINATION RANGE
    ========================================================= */

    $from =
        $total > 0
            ? $offset + 1
            : 0;


    $to =
        $total > 0
            ? min(
                $offset + $limit,
                $total
            )
            : 0;


    /* =========================================================
       RESPONSE
    ========================================================= */

    echo json_encode([

        "success" => true,

        "data" =>
            $complaints,

        "pagination" => [

            "page" =>
                $page,

            "limit" =>
                $limit,

            "total" =>
                $total,

            "totalPages" =>
                $totalPages,

            "from" =>
                $from,

            "to" =>
                $to

        ]

    ]);

}
catch (PDOException $e) {

    http_response_code(500);

    echo json_encode([

        "success" => false,

        "message" =>
            "Database error.",

        "error" =>
            $e->getMessage()

    ]);

}
catch (Throwable $e) {

    http_response_code(500);

    echo json_encode([

        "success" => false,

        "message" =>
            "Server error.",

        "error" =>
            $e->getMessage()

    ]);

}
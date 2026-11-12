<?php

error_reporting(E_ALL);
ini_set('display_errors', 0);

header('Content-Type: application/json');

session_start();

error_log(
    "DISPATCH SESSION: " .
    print_r($_SESSION, true)
);

require_once "../db.php";


/* ============================================================
   RESPONSE HELPER
============================================================ */

function jsonResponse(
    bool $success,
    string $message = "",
    array $data = []
) {

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


/* ============================================================
   AUTHENTICATION
============================================================ */

if (
    !isset($_SESSION['logged_in']) ||
    $_SESSION['logged_in'] !== true
) {

    jsonResponse(
        false,
        "You are not logged in."
    );

}


/* ============================================================
   DISPATCH TEAM AUTHENTICATION
============================================================ */

if (
    !isset($_SESSION['user_type']) ||
    $_SESSION['user_type'] !== 'dispatch_team'
) {

    jsonResponse(
        false,
        "Dispatch Team access required."
    );

}


/* ============================================================
   GET TEAM ID FROM SESSION
============================================================ */

$teamID =
    $_SESSION['team_id']
    ?? null;


if (!$teamID) {

    jsonResponse(
        false,
        "Dispatch Team ID not found in session."
    );

}


$teamID = (int) $teamID;


if ($teamID <= 0) {

    jsonResponse(
        false,
        "Invalid Dispatch Team ID."
    );

}


try {

    /* ========================================================
       GET DISPATCH TEAM
    ======================================================== */

    $sqlTeam = "

    SELECT

        teamID,
        teamName,
        department,
        teamLeader,
        contactNumber,
        email,
        status,
        currentComplaintID,

        currentLatitude,
        currentLongitude,
        locationAccuracy,
        lastLocationUpdate,

        createdAt

    FROM tbl_dispatch_teams

    WHERE teamID = :teamID

    LIMIT 1

";


    $stmtTeam =
        $pdo->prepare(
            $sqlTeam
        );


    $stmtTeam->execute([
        ':teamID' => $teamID
    ]);


    $team =
        $stmtTeam->fetch(
            PDO::FETCH_ASSOC
        );


    if (!$team) {

        jsonResponse(
            false,
            "Dispatch Team account not found."
        );

    }


    /* ========================================================
       GET ASSIGNED COMPLAINTS
    ======================================================== */

    $sqlComplaints = "

    SELECT

        c.complaintID,
        c.citizenID,
        c.assignedStaffID,
        c.dispatchTeamID,

        c.dispatchStatus,

        c.rawComplaintText,

        ai.category AS aiCategory,
        ai.urgency AS aiUrgency,
        ai.location AS aiLocation,

        cl.latitude,
        cl.longitude,
        cl.accuracy,
        cl.recordedAt AS locationRecordedAt,

        c.status,

        c.createdAt,
        c.deadlineAt,
        c.firstResponseAt,
        c.completedAt,
        c.slaStatus,

        ci.fullName AS citizenName,
        ci.contactNumber AS citizenContact

    FROM tbl_complaints c

    LEFT JOIN tbl_citizens ci
        ON ci.citizenID = c.citizenID

    LEFT JOIN tbl_complaint_locations cl
        ON cl.complaintID = c.complaintID

    LEFT JOIN tbl_ai_analysis ai
        ON ai.complaintID = c.complaintID

    WHERE c.dispatchTeamID = :teamID

    ORDER BY

    CASE

        WHEN
            c.complaintID = :currentComplaintID

            AND c.dispatchStatus IN (
                'Assigned',
                'On the Way',
                'Arrived'
            )

        THEN 0

        WHEN
            c.dispatchStatus IN (
                'Assigned',
                'On the Way',
                'Arrived'
            )

        THEN 1

        ELSE 2

    END,

    CASE

        WHEN ai.urgency = 'HIGH'
        THEN 0

        ELSE 1

    END,

    c.createdAt ASC

";


    $stmtComplaints =
        $pdo->prepare(
            $sqlComplaints
        );


    $stmtComplaints->execute([

        ':teamID' =>
            $teamID,

        ':currentComplaintID' =>
            $team['currentComplaintID'] ?? 0

    ]);


    $complaints =
        $stmtComplaints->fetchAll(
            PDO::FETCH_ASSOC
        );


    /* ========================================================
       DETERMINE ACTIVE ASSIGNMENT
    ======================================================== */

    $activeComplaint = null;


    $currentComplaintID =
        $team['currentComplaintID']
        ?? null;


    /*
     * First priority:
     * tbl_dispatch_teams.currentComplaintID
     */

    if ($currentComplaintID) {

        foreach (
            $complaints
            as $complaint
        ) {

            if (
                (int) $complaint['complaintID']
                ===
                (int) $currentComplaintID
            ) {

                $dispatchStatus =
                    strtolower(
                        trim(
                            $complaint[
                                'dispatchStatus'
                            ] ?? ""
                        )
                    );


                if (
                    in_array(
                        $dispatchStatus,
                        [
                            'assigned',
                            'on the way',
                            'arrived'
                        ],
                        true
                    )
                ) {

                    $activeComplaint =
                        $complaint;

                }


                break;

            }

        }

    }


    /*
     * Fallback:
     *
     * If currentComplaintID is NULL or invalid,
     * find the oldest active complaint.
     */

    if (!$activeComplaint) {

        foreach (
            $complaints
            as $complaint
        ) {

            $dispatchStatus =
                strtolower(
                    trim(
                        $complaint[
                            'dispatchStatus'
                        ] ?? ""
                    )
                );


            if (
                in_array(
                    $dispatchStatus,
                    [
                        'assigned',
                        'on the way',
                        'arrived'
                    ],
                    true
                )
            ) {

                $activeComplaint =
                    $complaint;

                break;

            }

        }

    }


    /* ========================================================
       OTHER ASSIGNMENTS
    ======================================================== */

    $otherAssignments = [];


    foreach (
        $complaints
        as $complaint
    ) {

        if (
            $activeComplaint
            &&
            (int) $complaint['complaintID']
            ===
            (int) $activeComplaint['complaintID']
        ) {

            continue;

        }


        $otherAssignments[] =
            $complaint;

    }


    /* ========================================================
       COUNTS
    ======================================================== */

    $activeCount = 0;

    $assignedCount = 0;

    $completedToday = 0;


    foreach (
        $complaints
        as $complaint
    ) {

        $dispatchStatus =
            strtolower(
                trim(
                    $complaint[
                        'dispatchStatus'
                    ] ?? ""
                )
            );


        /*
         * Active
         */

        if (
            in_array(
                $dispatchStatus,
                [
                    'assigned',
                    'on the way',
                    'arrived'
                ],
                true
            )
        ) {

            $activeCount++;

        }


        /*
         * Assigned
         */

        if (
            $dispatchStatus ===
            'assigned'
        ) {

            $assignedCount++;

        }


        /*
         * Completed today
         */

        if (
            (
                $dispatchStatus ===
                'resolved'
            )
            ||
            (
                $dispatchStatus ===
                'unable to resolve'
            )
        ) {

            if (
                !empty(
                    $complaint[
                        'completedAt'
                    ]
                )
            ) {

                $completedDate =
                    date(
                        'Y-m-d',
                        strtotime(
                            $complaint[
                                'completedAt'
                            ]
                        )
                    );


                if (
                    $completedDate ===
                    date('Y-m-d')
                ) {

                    $completedToday++;

                }

            }

        }

    }


    /* ========================================================
       RETURN RESPONSE
    ======================================================== */

    jsonResponse(
        true,
        "Dispatch dashboard loaded successfully.",
        [

            "user" => [

            "teamID" =>
                (int) $team['teamID'],

            "teamName" =>
                $team['teamName'],

            "department" =>
                $team['department'],

            "teamLeader" =>
                $team['teamLeader'],

            "contactNumber" =>
                $team['contactNumber'],

            "email" =>
                $team['email'],

            "status" =>
                $team['status'],

            "currentComplaintID" =>
                $team['currentComplaintID'],

            "currentLatitude" =>
                $team['currentLatitude'],

            "currentLongitude" =>
                $team['currentLongitude'],

            "locationAccuracy" =>
                $team['locationAccuracy'],

            "lastLocationUpdate" =>
                $team['lastLocationUpdate']

        ],


            /*
             * The main active assignment
             */

            "activeComplaint" =>
                $activeComplaint,


            /*
             * All other complaints
             */

            "otherAssignments" =>
                $otherAssignments,


            /*
             * All complaints assigned to team
             */

            "complaints" =>
                $complaints,


            /*
             * Dashboard statistics
             */

            "summary" => [

                "active" =>
                    $activeCount,

                "assigned" =>
                    $assignedCount,

                "completedToday" =>
                    $completedToday

            ]

        ]
    );

}
catch (PDOException $e) {

    error_log(
        "dispatchUserData.php: " .
        $e->getMessage()
    );


    jsonResponse(
        false,
        "Database error while loading dispatch dashboard."
    );

}

?>
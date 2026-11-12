<?php

header('Content-Type: application/json');

session_start();

require_once '../db.php';

try {

    /*
    ============================================================
    EMERGENCY CLUSTER SETTINGS
    ============================================================
    */

    // Look at complaints from the last 24 hours
    $timeWindowMinutes = 1440;

    // Complaints must be within this distance
    $radiusMeters = 250;

    // Emergency threshold
    $emergencyComplaintCount = 5;
    $emergencyHighCount = 3;

    // Critical threshold
    $criticalComplaintCount = 10;
    $criticalHighCount = 5;


    /*
    ============================================================
    GET CURRENT USER DEPARTMENT
    ============================================================
    */

    $userDepartment =
        strtoupper(
            trim(
                $_SESSION['department'] ?? ''
            )
        );


    /*
    ============================================================
    DEPARTMENT EMERGENCY ACCESS
    ============================================================

    IT
        - Fire HIGH
        - Flood HIGH
        - Obstruction HIGH
        - Traffic HIGH

    BFP
        - Fire HIGH
        - Flood HIGH

    MCAT
        - Obstruction HIGH

    PSTMO
        - Traffic HIGH

    NORMAL complaints NEVER trigger emergency alerts.
    ============================================================
    */

    if ($userDepartment === 'IT') {

        $departmentCondition = "
            UPPER(a.urgency) = 'HIGH'

            AND UPPER(a.category) IN (
                'FIRE',
                'FLOOD',
                'OBSTRUCTION',
                'TRAFFIC'
            )
        ";

    }

    elseif ($userDepartment === 'BFP') {

        $departmentCondition = "
            UPPER(a.urgency) = 'HIGH'

            AND (
                UPPER(a.category) = 'FIRE'

                OR

                UPPER(a.category) = 'FLOOD'
            )
        ";

    }

    elseif ($userDepartment === 'MCAT') {

        $departmentCondition = "
            UPPER(a.urgency) = 'HIGH'

            AND UPPER(a.category) = 'OBSTRUCTION'
        ";

    }

    elseif ($userDepartment === 'PSTMO') {

        $departmentCondition = "
            UPPER(a.urgency) = 'HIGH'

            AND UPPER(a.category) = 'TRAFFIC'
        ";

    }

    else {

        /*
         * No department assigned.
         * Do not return emergency complaints.
         */

        $departmentCondition = "1 = 0";

    }


    /*
    ============================================================
    GET RECENT ACTIVE COMPLAINTS
    ============================================================
    */

    $sql = "
        SELECT
            c.complaintID,
            c.complaintReference,
            c.status,
            c.createdAt,

            a.category,
            a.urgency,

            cl.latitude,
            cl.longitude

        FROM tbl_complaints c

        INNER JOIN tbl_ai_analysis a
            ON a.complaintID = c.complaintID

        INNER JOIN tbl_complaint_locations cl
            ON cl.complaintID = c.complaintID

        WHERE
            c.createdAt >= DATE_SUB(
                NOW(),
                INTERVAL :minutes MINUTE
            )

            AND c.status IN (
                'Pending',
                'Verified',
                'In Progress'
            )

            AND cl.latitude IS NOT NULL
            AND cl.longitude IS NOT NULL

            AND $departmentCondition

        ORDER BY
            c.createdAt ASC
    ";

    $stmt = $pdo->prepare($sql);

    $stmt->bindValue(
        ':minutes',
        $timeWindowMinutes,
        PDO::PARAM_INT
    );

    $stmt->execute();

    $complaints =
        $stmt->fetchAll(
            PDO::FETCH_ASSOC
        );


    /*
    ============================================================
    HELPER: DISTANCE BETWEEN TWO COORDINATES
    ============================================================
    */

    function calculateDistanceMeters(
        $lat1,
        $lon1,
        $lat2,
        $lon2
    ) {

        $earthRadius = 6371000;

        $lat1 =
            deg2rad(
                (float)$lat1
            );

        $lat2 =
            deg2rad(
                (float)$lat2
            );

        $latDiff =
            deg2rad(
                (float)$lat2 -
                (float)$lat1
            );

        $lonDiff =
            deg2rad(
                (float)$lon2 -
                (float)$lon1
            );

        $a =
            sin($latDiff / 2) *
            sin($latDiff / 2)

            +

            cos($lat1) *
            cos($lat2) *
            sin($lonDiff / 2) *
            sin($lonDiff / 2);

        $c =
            2 *
            atan2(
                sqrt($a),
                sqrt(1 - $a)
            );

        return $earthRadius * $c;
    }


    /*
    ============================================================
    GROUP COMPLAINTS BY CATEGORY
    ============================================================
    */

    $categories = [];

    foreach (
        $complaints
        as $complaint
    ) {

        $category =
            strtoupper(
                trim(
                    $complaint['category']
                )
            );

        if (
            !isset(
                $categories[$category]
            )
        ) {

            $categories[$category] = [];

        }

        $categories[$category][] =
            $complaint;
    }


    /*
    ============================================================
    BUILD CLUSTERS
    ============================================================
    */

    $clusters = [];

    foreach (
        $categories
        as $category =>
        $categoryComplaints
    ) {

        $used = [];

        foreach (
            $categoryComplaints
            as $index =>
            $complaint
        ) {

            if (
                isset(
                    $used[$index]
                )
            ) {

                continue;

            }


            /*
            ====================================================
            START A NEW CLUSTER
            ====================================================
            */

            $cluster = [

                'category' =>
                    $category,

                'complaints' =>
                    [],

                'centerLat' =>
                    (float)
                    $complaint['latitude'],

                'centerLng' =>
                    (float)
                    $complaint['longitude']

            ];

            $cluster['complaints'][] =
                $complaint;

            $used[$index] =
                true;


            /*
            ====================================================
            ADD NEARBY COMPLAINTS
            ====================================================
            */

            foreach (
                $categoryComplaints
                as $otherIndex =>
                $otherComplaint
            ) {

                if (
                    isset(
                        $used[$otherIndex]
                    )
                ) {

                    continue;

                }


                $distance =
                    calculateDistanceMeters(

                        $cluster['centerLat'],

                        $cluster['centerLng'],

                        $otherComplaint['latitude'],

                        $otherComplaint['longitude']

                    );


                if (
                    $distance <=
                    $radiusMeters
                ) {

                    $cluster['complaints'][] =
                        $otherComplaint;

                    $used[$otherIndex] =
                        true;


                    /*
                    ============================================
                    RECALCULATE CLUSTER CENTER
                    ============================================
                    */

                    $latTotal = 0;
                    $lngTotal = 0;

                    $count =
                        count(
                            $cluster['complaints']
                        );


                    foreach (
                        $cluster['complaints']
                        as $member
                    ) {

                        $latTotal +=
                            (float)
                            $member['latitude'];

                        $lngTotal +=
                            (float)
                            $member['longitude'];

                    }


                    $cluster['centerLat'] =
                        $latTotal /
                        $count;

                    $cluster['centerLng'] =
                        $lngTotal /
                        $count;

                }

            }


            /*
            ====================================================
            COUNT HIGH URGENCY
            ====================================================
            */

            $totalComplaints =
                count(
                    $cluster['complaints']
                );

            $highCount = 0;


            foreach (
                $cluster['complaints']
                as $member
            ) {

                if (
                    strtoupper(
                        trim(
                            $member['urgency']
                        )
                    ) === 'HIGH'
                ) {

                    $highCount++;

                }

            }


            /*
            ====================================================
            DETERMINE SEVERITY
            ====================================================
            */

            $severity = null;


            /*
            CRITICAL
            */

            if (

                $totalComplaints >=
                $criticalComplaintCount

                &&

                $highCount >=
                $criticalHighCount

            ) {

                $severity =
                    'CRITICAL';

            }


            /*
            EMERGENCY
            */

            elseif (

                $totalComplaints >=
                $emergencyComplaintCount

                &&

                $highCount >=
                $emergencyHighCount

            ) {

                $severity =
                    'EMERGENCY';

            }


            /*
            ====================================================
            ONLY RETURN ACTUAL EMERGENCY CLUSTERS
            ====================================================
            */

            if (
                $severity !== null
            ) {

                $complaintIDs = [];


                foreach (
                    $cluster['complaints']
                    as $member
                ) {

                    $complaintIDs[] =
                        (int)
                        $member['complaintID'];

                }


                $clusters[] = [

                    'severity' =>
                        $severity,

                    'category' =>
                        $category,

                    'totalComplaints' =>
                        $totalComplaints,

                    'highCount' =>
                        $highCount,

                    'center' => [

                        'latitude' =>
                            $cluster['centerLat'],

                        'longitude' =>
                            $cluster['centerLng']

                    ],

                    'complaintIDs' =>
                        $complaintIDs

                ];

            }

        }

    }


    /*
    ============================================================
    RESPONSE
    ============================================================
    */

    echo json_encode([

        'success' =>
            true,

        'department' =>
            $userDepartment,

        'timeWindowMinutes' =>
            $timeWindowMinutes,

        'radiusMeters' =>
            $radiusMeters,

        'clusters' =>
            $clusters

    ]);


} catch (PDOException $e) {

    http_response_code(500);

    echo json_encode([

        'success' =>
            false,

        'message' =>
            'Database error',

        'error' =>
            $e->getMessage()

    ]);

} catch (Throwable $e) {

    http_response_code(500);

    echo json_encode([

        'success' =>
            false,

        'message' =>
            'Server error',

        'error' =>
            $e->getMessage()

    ]);

}
?>
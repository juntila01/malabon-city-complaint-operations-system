<?php

error_reporting(E_ALL);
ini_set('display_errors', 0);

header('Content-Type: application/json');

session_start();

require_once "../db.php";


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


if (
    !isset($_SESSION['user_type']) ||
    $_SESSION['user_type'] !== 'dispatch_team'
) {

    jsonResponse(
        false,
        "Dispatch Team access required."
    );

}


$teamID =
    (int) (
        $_SESSION['team_id']
        ?? 0
    );


if ($teamID <= 0) {

    jsonResponse(
        false,
        "Invalid Dispatch Team ID."
    );

}


/* ============================================================
   GET REQUEST DATA
============================================================ */

$input =
    json_decode(
        file_get_contents("php://input"),
        true
    );


if (!is_array($input)) {

    jsonResponse(
        false,
        "Invalid request data."
    );

}


$latitude =
    isset($input['latitude'])
        ? (float) $input['latitude']
        : null;


$longitude =
    isset($input['longitude'])
        ? (float) $input['longitude']
        : null;


$accuracy =
    isset($input['accuracy'])
        ? (float) $input['accuracy']
        : null;


/* ============================================================
   VALIDATE COORDINATES
============================================================ */

if (
    $latitude === null ||
    $longitude === null
) {

    jsonResponse(
        false,
        "Latitude and longitude are required."
    );

}


if (
    !is_finite($latitude) ||
    !is_finite($longitude)
) {

    jsonResponse(
        false,
        "Invalid GPS coordinates."
    );

}


if (
    $latitude < -90 ||
    $latitude > 90
) {

    jsonResponse(
        false,
        "Invalid latitude."
    );

}


if (
    $longitude < -180 ||
    $longitude > 180
) {

    jsonResponse(
        false,
        "Invalid longitude."
    );

}


try {

    $sql = "

        UPDATE tbl_dispatch_teams

        SET

            currentLatitude = :latitude,

            currentLongitude = :longitude,

            locationAccuracy = :accuracy,

            lastLocationUpdate = NOW()

        WHERE teamID = :teamID

        LIMIT 1

    ";


    $stmt =
        $pdo->prepare($sql);


    $stmt->execute([

        ':latitude' =>
            $latitude,

        ':longitude' =>
            $longitude,

        ':accuracy' =>
            $accuracy,

        ':teamID' =>
            $teamID

    ]);


    jsonResponse(
        true,
        "Dispatch team location updated.",
        [

            "latitude" =>
                $latitude,

            "longitude" =>
                $longitude,

            "accuracy" =>
                $accuracy,

            "updatedAt" =>
                date("Y-m-d H:i:s")

        ]
    );

}
catch (PDOException $e) {

    error_log(
        "updateTeamLocation.php: " .
        $e->getMessage()
    );


    jsonResponse(
        false,
        "Unable to update dispatch team location."
    );

}
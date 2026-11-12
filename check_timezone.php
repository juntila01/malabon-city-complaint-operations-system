<?php

require_once __DIR__ . "/db.php";

header("Content-Type: application/json");

$stmt = $pdo->query("
    SELECT
        NOW() AS mysql_now,
        UTC_TIMESTAMP() AS utc_now,
        TIMEDIFF(NOW(), UTC_TIMESTAMP()) AS timezone_difference,
        @@session.time_zone AS session_timezone
");

echo json_encode(
    $stmt->fetch(PDO::FETCH_ASSOC),
    JSON_PRETTY_PRINT
);
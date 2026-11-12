<?php

include "../db.php";

$sql = "SELECT * FROM complaints ORDER BY created_at DESC";

$stmt = $pdo->prepare($sql);
$stmt->execute();

$complaints = $stmt->fetchAll(PDO::FETCH_ASSOC);

header("Content-Type: application/json");

echo json_encode($complaints);
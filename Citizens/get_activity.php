<?php
session_start();
header("Content-Type: application/json");

require_once "../db.php";

if (!isset($_SESSION['user_id'])) {
    echo json_encode([
        "success" => false,
        "message" => "Not logged in"
    ]);
    exit;
}

$citizenID = $_SESSION['user_id'];

try {

    $stmt = $pdo->prepare("
        SELECT
            SUM(CASE WHEN status IN ('Pending','Assigned','In Progress') THEN 1 ELSE 0 END) AS pending,
            SUM(CASE WHEN status='Resolved' THEN 1 ELSE 0 END) AS resolved
        FROM tbl_complaints
        WHERE citizenID = ?
    ");

    $stmt->execute([$citizenID]);

    $data = $stmt->fetch(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => true,
        "pending" => (int)$data["pending"],
        "resolved" => (int)$data["resolved"]
    ]);

} catch(PDOException $e){

    echo json_encode([
        "success"=>false,
        "message"=>$e->getMessage()
    ]);

}
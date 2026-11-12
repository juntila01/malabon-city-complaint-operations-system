<?php

function logOperation(
    PDO $pdo,
    string $actorType,
    ?int $actorID,
    string $actorName,
    string $action,
    string $description,
    ?int $complaintID = null,
    ?string $oldValue = null,
    ?string $newValue = null
) {

    $ipAddress = $_SERVER['REMOTE_ADDR'] ?? null;

    $sql = "
        INSERT INTO tbl_operational_logs
        (
            complaintID,
            actorType,
            actorID,
            actorName,
            action,
            description,
            oldValue,
            newValue,
            ipAddress,
            createdAt
        )
        VALUES
        (
            :complaintID,
            :actorType,
            :actorID,
            :actorName,
            :action,
            :description,
            :oldValue,
            :newValue,
            :ipAddress,
            NOW()
        )
    ";

    $stmt = $pdo->prepare($sql);

    $stmt->execute([
        ':complaintID' => $complaintID,
        ':actorType' => $actorType,
        ':actorID' => $actorID,
        ':actorName' => $actorName,
        ':action' => $action,
        ':description' => $description,
        ':oldValue' => $oldValue,
        ':newValue' => $newValue,
        ':ipAddress' => $ipAddress
    ]);
}
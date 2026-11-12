<?php

function logOperationalEvent(
    PDO $pdo,
    ?int $complaintID,
    string $actorType,
    ?int $actorID,
    ?string $actorName,
    string $action,
    string $description,
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

    return $stmt->execute([
        ':complaintID' => $complaintID,
        ':actorType'   => $actorType,
        ':actorID'     => $actorID,
        ':actorName'   => $actorName,
        ':action'      => $action,
        ':description' => $description,
        ':oldValue'    => $oldValue,
        ':newValue'    => $newValue,
        ':ipAddress'   => $ipAddress
    ]);
}
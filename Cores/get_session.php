<?php

session_start();

header('Content-Type: application/json');

echo json_encode([
    'success' => true,
    'logged_in' => !empty($_SESSION['logged_in']),
    'role' => $_SESSION['user_role'] ?? null,
    'user_type' => $_SESSION['user_type'] ?? null,
    'department' => $_SESSION['department'] ?? null
]);
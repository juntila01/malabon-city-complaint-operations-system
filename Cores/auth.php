<?php

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}


/**
 * ============================================================
 * CHECK IF USER IS LOGGED IN
 * ============================================================
 */
function requireLogin(): void
{
    if (
        empty($_SESSION['logged_in']) ||
        $_SESSION['logged_in'] !== true
    ) {

        header("Location: /Complaint/Cores/login.html");
        exit;
    }
}


/**
 * ============================================================
 * GET CURRENT USER ROLE
 * ============================================================
 *
 * Expected values:
 *
 * admin
 * staff
 *
 */
function currentRole(): string
{
    return strtolower(
        trim(
            $_SESSION['user_role'] ?? ''
        )
    );
}


/**
 * ============================================================
 * GET CURRENT USER DEPARTMENT
 * ============================================================
 *
 * Expected values:
 *
 * IT
 * BFP
 * MCAT
 * PSTMO
 *
 */
function currentDepartment(): string
{
    return strtoupper(
        trim(
            $_SESSION['department'] ?? ''
        )
    );
}


/**
 * ============================================================
 * CHECK WHETHER CURRENT USER HAS AN ALLOWED ROLE
 * ============================================================
 */
function hasRole(array $roles): bool
{
    $role = currentRole();

    $roles = array_map(
        static function ($value) {
            return strtolower(
                trim(
                    (string) $value
                )
            );
        },
        $roles
    );

    return in_array(
        $role,
        $roles,
        true
    );
}


/**
 * ============================================================
 * REQUIRE ONE OF THE SPECIFIED ROLES
 * ============================================================
 */
function requireRole(array $roles): void
{
    requireLogin();

    if (!hasRole($roles)) {

        http_response_code(403);

        echo <<<HTML
<!DOCTYPE html>
<html lang="en">

<head>

    <meta charset="UTF-8">

    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    >

    <title>Access Denied</title>

    <style>

        body {
            margin: 0;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f8fafc;
            font-family: Arial, sans-serif;
        }

        .box {
            background: white;
            padding: 40px;
            border-radius: 16px;
            box-shadow: 0 10px 30px rgba(0,0,0,.08);
            text-align: center;
            max-width: 420px;
            width: calc(100% - 40px);
        }

        h1 {
            margin: 0 0 10px;
            color: #dc2626;
        }

        p {
            color: #64748b;
            line-height: 1.6;
        }

        a {
            display: inline-block;
            margin-top: 20px;
            padding: 10px 18px;
            background: #2563eb;
            color: white;
            text-decoration: none;
            border-radius: 8px;
        }

        a:hover {
            background: #1d4ed8;
        }

    </style>

</head>

<body>

<div class="box">

    <h1>403 - Access Denied</h1>

    <p>
        You do not have permission to access this page.
    </p>

    <a href="/Complaint/admindashboard.html">
        Return to Dashboard
    </a>

</div>

</body>

</html>
HTML;

        exit;
    }
}
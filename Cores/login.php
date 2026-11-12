<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
session_start();

if (!isset($_SESSION['login_attempts'])) {
    $_SESSION['login_attempts'] = 0;
}

if (!isset($_SESSION['lock_until'])) {
    $_SESSION['lock_until'] = 0;
}

require_once "../db.php";
require_once "../Reports/log_operation.php";


if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Check if user is temporarily locked out
if (time() < $_SESSION['lock_until']) {

    $remaining = $_SESSION['lock_until'] - time();

    header("Location: login.html?locked=$remaining");
    exit;
}
    
    $email    = isset($_POST['email']) ? filter_var(trim($_POST['email']), FILTER_SANITIZE_EMAIL) : '';
    $password = isset($_POST['password']) ? $_POST['password'] : '';

    if (empty($email) || empty($password)) {
        $_SESSION['login_attempts']++;

if ($_SESSION['login_attempts'] >= 5) {

    $_SESSION['login_attempts'] = 0;
    $_SESSION['lock_until'] = time() + (5 * 60); // 5 minutes

    header("Location: login.html?locked=300");
    exit;
}

header("Location: login.html?error=invalid_credentials");
exit;
    }

    // 1. HARDCODED BACKDOOR FOR EMERGENCY TESTING
    if ($email === 'admin@test.com' && $password === 'password123') {
        session_regenerate_id(true);
        $_SESSION['login_attempts'] = 0;
        $_SESSION['lock_until'] = 0;
        $_SESSION['user_id']    = 1;
        $_SESSION['user_email'] = 'admin@test.com';
        $_SESSION['user_role']  = 'admin'; 
        $_SESSION['logged_in']  = true;

        header("Location: ../admindashboard.php");
        exit;
    }

    // 2. Try looking in the System Users table first
    $sql_system = "SELECT systemUsersID AS id, email, passwordHash, role, department FROM tbl_systemusers WHERE email = :email LIMIT 1";
    $stmt_system = $pdo->prepare($sql_system);
    $stmt_system->execute(['email' => $email]);
    $user = $stmt_system->fetch();

    if ($user && password_verify($password, $user['passwordHash'])) {
        $role = !empty($user['role']) ? strtolower(trim($user['role'])) : 'staff';
        
        session_regenerate_id(true);
        $_SESSION['login_attempts'] = 0;
        $_SESSION['lock_until'] = 0;
        $_SESSION['user_id']    = $user['id'];
        $_SESSION['user_email'] = $user['email'];
        $_SESSION['user_role']  = $role;
        $_SESSION['user_type']  = 'system';
        $_SESSION['department'] = !empty($user['department'])
            ? trim($user['department'])
            : null;
        $_SESSION['logged_in']  = true;

        logOperation(
            $pdo,
            'system_user',
            (int)$user['id'],
            $user['email'],
            'Login',
            'System user logged into the system.'
        );

        if (in_array($role, ['admin', 'staff'], true)) {
            header("Location: ../admindashboard.php");
            exit;

        if ($role === 'dispatcher') {

            header("Location: ../Dispatchs/dispatchUser.html");
            exit;
        }
        } else {
            header("Location: ../Citizens/citizen.php");
            exit;
        }
    }
    // 3. Try looking in the Dispatch Teams table

$sql_dispatch = "
    SELECT 
        teamID AS id,
        teamName,
        email,
        passwordHash,
        department,
        teamLeader,
        status
    FROM tbl_dispatch_teams
    WHERE email = :email
    LIMIT 1
";

$stmt_dispatch = $pdo->prepare($sql_dispatch);

$stmt_dispatch->execute([
    'email' => $email
]);

$dispatch = $stmt_dispatch->fetch();

if ($dispatch && password_verify($password, $dispatch['passwordHash'])) {

    session_regenerate_id(true);

    $_SESSION['login_attempts'] = 0;
    $_SESSION['lock_until'] = 0;

    // Basic account information
    $_SESSION['user_id'] = $dispatch['id'];
    $_SESSION['user_email'] = $dispatch['email'];
    $_SESSION['user_role'] = 'dispatch_team';
    $_SESSION['user_type'] = 'dispatch_team';

    // Dispatch team information
    $_SESSION['team_id'] = $dispatch['id'];
    $_SESSION['team_name'] = $dispatch['teamName'];
    $_SESSION['team_department'] = $dispatch['department'];
    $_SESSION['team_leader'] = $dispatch['teamLeader'];
    $_SESSION['team_status'] = $dispatch['status'];

    $_SESSION['logged_in'] = true;

    logOperation(
    $pdo,
        'dispatch_team',
        (int)$dispatch['id'],
        $dispatch['email'],
        'Login',
        'Dispatch team logged into the system.'
    );

    // Redirect to Dispatch Team dashboard
    header("Location: ../Dispatchs/dispatchUser.html");
    exit;
}

    // 3. If not found in system users, search the Citizens table
    // NOTE: Matching the precise table columns 'citizenID' and 'passwordHash' from registration
    $sql_citizen = "SELECT citizenID AS id, email, passwordHash, verificationStatus FROM tbl_citizens WHERE email = :email LIMIT 1";
    $stmt_citizen = $pdo->prepare($sql_citizen);
    $stmt_citizen->execute(['email' => $email]);
    $citizen = $stmt_citizen->fetch();

    if ($citizen && password_verify($password, $citizen['passwordHash'])) {
        session_regenerate_id(true);
        $_SESSION['login_attempts'] = 0;
        $_SESSION['lock_until'] = 0;
        $_SESSION['user_id']             = $citizen['id'];
        $_SESSION['user_email']          = $citizen['email'];
        $_SESSION['user_role']           = 'citizen'; // Standard role tag for citizens
        $_SESSION['user_type']           = 'citizen'; 
        $_SESSION['verification_status'] = $citizen['verificationStatus']; 
        $_SESSION['logged_in']           = true;

        logOperation(
            $pdo,
            'citizen',
            (int)$citizen['id'],
            $citizen['email'],
            'Login',
            'Citizen logged into the system.'
        );

        // Redirect ordinary citizens directly to their submission dashboard
        header("Location: ../Citizens/citizen.php");
        exit;
    }
    

    // If it reaches this point, authentication failed across both tables
    $_SESSION['login_attempts']++;

if ($_SESSION['login_attempts'] >= 5) {

    $_SESSION['login_attempts'] = 0;
    $_SESSION['lock_until'] = time() + (5 * 60); // 5 minutes

    header("Location: login.html?locked=300");
    exit;
}

header("Location: login.html?error=invalid_credentials");
exit;
    exit;

} else {
    header("Location: login.html");
    exit;
}
?>
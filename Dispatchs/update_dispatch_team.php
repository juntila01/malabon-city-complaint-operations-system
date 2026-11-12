
<?php

header('Content-Type: application/json; charset=utf-8');

require_once "../Cores/auth.php";
requireRole(['admin']);

require_once "../db.php";
require_once "../Reports/log_operation.php";

function jsonResponse(
    bool $success,
    string $message,
    array $data = [],
    int $httpCode = 200
): void {
    http_response_code($httpCode);

    echo json_encode(array_merge([
        'success' => $success,
        'message' => $message
    ], $data));

    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, 'Invalid request method.', [], 405);
}

$adminDepartment = strtoupper(
    trim((string) currentDepartment())
);

$allowedDepartments = ['IT', 'BFP', 'MCAT', 'PSTMO'];
$dispatchDepartments = ['BFP', 'MCAT', 'PSTMO'];

if (!in_array($adminDepartment, $allowedDepartments, true)) {
    jsonResponse(false, 'Invalid administrative department.', [], 403);
}

$teamID = filter_var(
    $_POST['teamID'] ?? null,
    FILTER_VALIDATE_INT
);

if (!$teamID || $teamID < 1) {
    jsonResponse(false, 'Invalid dispatch team ID.', [], 400);
}

$teamName = trim((string) ($_POST['teamName'] ?? ''));
$department = strtoupper(trim((string) ($_POST['department'] ?? '')));
$teamLeader = trim((string) ($_POST['teamLeader'] ?? ''));
$contactNumber = trim((string) ($_POST['contactNumber'] ?? ''));
$email = trim((string) ($_POST['email'] ?? ''));
$password = (string) ($_POST['password'] ?? '');
$status = trim((string) ($_POST['status'] ?? ''));

$allowedStatuses = [
    'Available',
    'Dispatched',
    'On Break',
    'Offline',
    'Off Duty',
    'Maintenance'
];

if ($teamName === '' || strlen($teamName) > 150) {
    jsonResponse(false, 'Enter a valid team name.', [], 400);
}

if (!in_array($status, $allowedStatuses, true)) {
    jsonResponse(false, 'Invalid team status.', [], 400);
}

if (!in_array($department, $dispatchDepartments, true)) {
    jsonResponse(false, 'Select a valid dispatch department.', [], 400);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    jsonResponse(false, 'Enter a valid email address.', [], 400);
}

if (
    $contactNumber !== '' &&
    !preg_match('/^[0-9]{11}$/', $contactNumber)
) {
    jsonResponse(false, 'Contact number must be exactly 11 digits.', [], 400);
}

if ($password !== '') {
    if (strlen($password) < 8) {
        jsonResponse(false, 'Password must be at least 8 characters.', [], 400);
    }

    if (
        !preg_match('/[A-Z]/', $password) ||
        !preg_match('/[a-z]/', $password) ||
        !preg_match('/[0-9]/', $password) ||
        !preg_match('/[^A-Za-z0-9]/', $password)
    ) {
        jsonResponse(
            false,
            'The new password must contain uppercase, lowercase, number, and special character.',
            [],
            400
        );
    }
}

$teamLeader = $teamLeader === '' ? null : $teamLeader;
$contactNumber = $contactNumber === '' ? null : $contactNumber;

try {
    /*
     * Fetch the existing team and enforce department ownership.
     */
    $findTeam = $pdo->prepare("
        SELECT teamID, teamName, department
        FROM tbl_dispatch_teams
        WHERE teamID = ?
        LIMIT 1
    ");

    $findTeam->execute([$teamID]);
    $existingTeam = $findTeam->fetch(PDO::FETCH_ASSOC);

    if (!$existingTeam) {
        jsonResponse(false, 'Dispatch team not found.', [], 404);
    }

    $existingDepartment = strtoupper(
        trim((string) $existingTeam['department'])
    );

    if (
        $adminDepartment !== 'IT' &&
        $existingDepartment !== $adminDepartment
    ) {
        jsonResponse(
            false,
            'You are not authorized to edit this dispatch team.',
            [],
            403
        );
    }

    /*
     * Department admins cannot transfer a team to another department.
     */
    if (
        $adminDepartment !== 'IT' &&
        $department !== $adminDepartment
    ) {
        jsonResponse(
            false,
            'You can only assign teams to your own department.',
            [],
            403
        );
    }

    /*
     * Prevent duplicate emails belonging to another team.
     */
    $checkEmail = $pdo->prepare("
        SELECT teamID
        FROM tbl_dispatch_teams
        WHERE email = ?
          AND teamID <> ?
        LIMIT 1
    ");

    $checkEmail->execute([$email, $teamID]);

    if ($checkEmail->fetch(PDO::FETCH_ASSOC)) {
        jsonResponse(
            false,
            'This email is already being used by another dispatch team.',
            [],
            409
        );
    }

    /*
     * Prevent duplicate team names.
     */
    $checkName = $pdo->prepare("
        SELECT teamID
        FROM tbl_dispatch_teams
        WHERE teamName = ?
          AND teamID <> ?
        LIMIT 1
    ");

    $checkName->execute([$teamName, $teamID]);

    if ($checkName->fetch(PDO::FETCH_ASSOC)) {
        jsonResponse(
            false,
            'A dispatch team with this name already exists.',
            [],
            409
        );
    }

    /*
     * Update the existing team. Preserve its current password
     * unless a new password was provided.
     */
    if ($password !== '') {
        $passwordHash = password_hash($password, PASSWORD_DEFAULT);

        if ($passwordHash === false) {
            jsonResponse(
                false,
                'Unable to secure the new password.',
                [],
                500
            );
        }

        $update = $pdo->prepare("
            UPDATE tbl_dispatch_teams
            SET
                teamName = :teamName,
                department = :department,
                teamLeader = :teamLeader,
                contactNumber = :contactNumber,
                email = :email,
                status = :status,
                passwordHash = :passwordHash
            WHERE teamID = :teamID
        ");

        $update->execute([
            ':teamName' => $teamName,
            ':department' => $department,
            ':teamLeader' => $teamLeader,
            ':contactNumber' => $contactNumber,
            ':email' => $email,
            ':status' => $status,
            ':passwordHash' => $passwordHash,
            ':teamID' => $teamID
        ]);
    } else {
        $update = $pdo->prepare("
            UPDATE tbl_dispatch_teams
            SET
                teamName = :teamName,
                department = :department,
                teamLeader = :teamLeader,
                contactNumber = :contactNumber,
                email = :email,
                status = :status
            WHERE teamID = :teamID
        ");

        $update->execute([
            ':teamName' => $teamName,
            ':department' => $department,
            ':teamLeader' => $teamLeader,
            ':contactNumber' => $contactNumber,
            ':email' => $email,
            ':status' => $status,
            ':teamID' => $teamID
        ]);
    }

    $actorID = isset($_SESSION['user_id'])
        ? (int) $_SESSION['user_id']
        : null;

    $actorName = $_SESSION['user_name']
        ?? $_SESSION['name']
        ?? 'System Administrator';

    logOperation(
        $pdo,
        'system_user',
        $actorID,
        $actorName,
        'Updated Dispatch Team',
        "Updated dispatch team #{$teamID} ({$teamName}) under {$department}."
    );

    jsonResponse(
        true,
        'Dispatch team updated successfully.',
        [
            'teamID' => (int) $teamID,
            'department' => $department
        ]
    );

} catch (PDOException $e) {
    error_log('update_dispatch_team.php: ' . $e->getMessage());

    jsonResponse(
        false,
        'Database error while updating dispatch team.',
        [],
        500
    );
}

<?php

header('Content-Type: application/json');

require_once "../Cores/auth.php";
requireRole(['admin']);

require_once "../db.php";
require_once "../Reports/log_operation.php";


/* ============================================================
   JSON RESPONSE
============================================================ */

function jsonResponse(
    bool $success,
    string $message = '',
    array $data = [],
    int $httpCode = 200
): void {

    http_response_code($httpCode);

    echo json_encode(
        array_merge(
            [
                'success' => $success,
                'message' => $message
            ],
            $data
        )
    );

    exit;
}


/* ============================================================
   REQUEST METHOD
============================================================ */

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {

    jsonResponse(
        false,
        'Invalid request method.',
        [],
        405
    );

}


/* ============================================================
   CURRENT ADMIN
============================================================ */

$role = currentRole();

$adminDepartment = strtoupper(
    trim(currentDepartment() ?? '')
);


/*
 * Supported departments in the system.
 */
$allowedDepartments = [
    'IT',
    'BFP',
    'MCAT',
    'PSTMO'
];


/*
 * Department-specific admins.
 *
 * These admins can ONLY create teams
 * within their own department.
 */
$departmentAdminDepartments = [
    'BFP',
    'MCAT',
    'PSTMO'
];


/* ============================================================
   DETERMINE DEPARTMENT
============================================================ */

/*
 * IT ADMIN
 *
 * IT is the global administrative department.
 *
 * IT admins may choose:
 *
 * IT
 * BFP
 * MCAT
 * PSTMO
 */

if ($adminDepartment === 'IT') {

    $department = strtoupper(
        trim($_POST['department'] ?? '')
    );


    if (!in_array($department, $allowedDepartments, true)) {

        jsonResponse(
            false,
            'Please select a valid department.',
            [],
            400
        );

    }

}


/*
 * DEPARTMENT ADMIN
 *
 * BFP / MCAT / PSTMO admins are restricted
 * to their own department.
 *
 * The department supplied by the browser
 * is intentionally ignored.
 */

elseif (
    in_array(
        $adminDepartment,
        $departmentAdminDepartments,
        true
    )
) {

    $department = $adminDepartment;

}


/*
 * INVALID ADMIN DEPARTMENT
 */

else {

    jsonResponse(
        false,
        'Your account does not have a valid admin department.',
        [],
        403
    );

}


/* ============================================================
   GET FORM DATA
============================================================ */

$teamName = trim(
    $_POST['teamName'] ?? ''
);

$teamLeader = trim(
    $_POST['teamLeader'] ?? ''
);

$contactNumber = trim(
    $_POST['contactNumber'] ?? ''
);

$email = trim(
    $_POST['email'] ?? ''
);

$password = $_POST['password'] ?? '';

$status = trim(
    $_POST['status'] ?? 'Available'
);


/* ============================================================
   TEAM NAME
============================================================ */

if ($teamName === '') {

    jsonResponse(
        false,
        'Team name is required.',
        [],
        400
    );

}


/* ============================================================
   EMAIL
============================================================ */

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {

    jsonResponse(
        false,
        'Please enter a valid email address.',
        [],
        400
    );

}


/* ============================================================
   PASSWORD
============================================================ */

if (strlen($password) < 8) {

    jsonResponse(
        false,
        'Password must be at least 8 characters.',
        [],
        400
    );

}


/* ============================================================
   CONTACT NUMBER
============================================================ */

if (
    $contactNumber !== '' &&
    !preg_match('/^[0-9]{11}$/', $contactNumber)
) {

    jsonResponse(
        false,
        'Contact number must be exactly 11 digits.',
        [],
        400
    );

}


/* ============================================================
   STATUS
============================================================ */

$allowedStatuses = [
    'Available',
    'Dispatched',
    'On Break',
    'Offline'
];

if (!in_array($status, $allowedStatuses, true)) {

    jsonResponse(
        false,
        'Invalid status.',
        [],
        400
    );

}


/* ============================================================
   EMPTY VALUES → NULL
============================================================ */

$teamLeader =
    ($teamLeader === '')
        ? null
        : $teamLeader;

$contactNumber =
    ($contactNumber === '')
        ? null
        : $contactNumber;


/* ============================================================
   DATABASE
============================================================ */

try {

    /* ========================================================
       CHECK DUPLICATE EMAIL
    ======================================================== */

    $checkEmail = $pdo->prepare("
        SELECT teamID
        FROM tbl_dispatch_teams
        WHERE email = ?
        LIMIT 1
    ");

    $checkEmail->execute([
        $email
    ]);


    if ($checkEmail->fetch(PDO::FETCH_ASSOC)) {

        jsonResponse(
            false,
            'This email is already being used by a dispatch team.',
            [],
            409
        );

    }


    /* ========================================================
       CHECK DUPLICATE TEAM NAME
    ======================================================== */

    $checkTeam = $pdo->prepare("
        SELECT teamID
        FROM tbl_dispatch_teams
        WHERE teamName = ?
        LIMIT 1
    ");

    $checkTeam->execute([
        $teamName
    ]);


    if ($checkTeam->fetch(PDO::FETCH_ASSOC)) {

        jsonResponse(
            false,
            'A dispatch team with this name already exists.',
            [],
            409
        );

    }


    /* ========================================================
       HASH PASSWORD
    ======================================================== */

    $passwordHash = password_hash(
        $password,
        PASSWORD_DEFAULT
    );


    if ($passwordHash === false) {

        jsonResponse(
            false,
            'Unable to secure the dispatch team password.',
            [],
            500
        );

    }


    /* ========================================================
       INSERT DISPATCH TEAM
    ======================================================== */

    $stmt = $pdo->prepare("
        INSERT INTO tbl_dispatch_teams
        (
            teamName,
            department,
            teamLeader,
            contactNumber,
            email,
            passwordHash,
            status,
            currentComplaintID
        )
        VALUES
        (
            :teamName,
            :department,
            :teamLeader,
            :contactNumber,
            :email,
            :passwordHash,
            :status,
            NULL
        )
    ");


    $stmt->bindValue(
        ':teamName',
        $teamName,
        PDO::PARAM_STR
    );

    $stmt->bindValue(
        ':department',
        $department,
        PDO::PARAM_STR
    );

    $stmt->bindValue(
        ':teamLeader',
        $teamLeader,
        $teamLeader === null
            ? PDO::PARAM_NULL
            : PDO::PARAM_STR
    );

    $stmt->bindValue(
        ':contactNumber',
        $contactNumber,
        $contactNumber === null
            ? PDO::PARAM_NULL
            : PDO::PARAM_STR
    );

    $stmt->bindValue(
        ':email',
        $email,
        PDO::PARAM_STR
    );

    $stmt->bindValue(
        ':passwordHash',
        $passwordHash,
        PDO::PARAM_STR
    );

    $stmt->bindValue(
        ':status',
        $status,
        PDO::PARAM_STR
    );


    $stmt->execute();


    $teamID = (int) $pdo->lastInsertId();


    /* ========================================================
       CURRENT ADMIN INFORMATION
    ======================================================== */

    $actorID = isset($_SESSION['user_id'])
        ? (int) $_SESSION['user_id']
        : null;

    $actorName = $_SESSION['user_name']
        ?? $_SESSION['name']
        ?? 'System Administrator';


    /* ========================================================
       LOG OPERATION
    ======================================================== */

    logOperation(
        $pdo,
        'system_user',
        $actorID,
        $actorName,
        'Created Dispatch Team',
        "Created dispatch team #{$teamID} ({$teamName}) under {$department}."
    );


    /* ========================================================
       SUCCESS
    ======================================================== */

    jsonResponse(
        true,
        'Dispatch team added successfully.',
        [
            'teamID' => $teamID,
            'department' => $department
        ]
    );


} catch (PDOException $e) {

    error_log(
        "add_dispatch_team.php: " .
        $e->getMessage()
    );


    jsonResponse(
        false,
        'Database error while adding dispatch team.',
        [],
        500
    );

}
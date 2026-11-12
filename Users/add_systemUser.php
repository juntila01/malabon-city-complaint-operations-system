<?php

session_start();

header("Content-Type: application/json; charset=utf-8");

require_once "../Cores/auth.php";
requireRole(['admin']);

require_once "../db.php";
require_once "../Reports/log_operation.php";


/* ============================================================
   AUTHENTICATED ADMIN
============================================================ */

$adminDepartment = strtoupper(
    trim((string) currentDepartment())
);


/*
 * DEPARTMENT ACCESS RULES
 *
 * IT:
 *     Can create users in:
 *     IT / BFP / MCAT / PSTMO
 *
 * BFP:
 *     Can ONLY create BFP users
 *
 * MCAT:
 *     Can ONLY create MCAT users
 *
 * PSTMO:
 *     Can ONLY create PSTMO users
 *
 * IMPORTANT:
 * The authenticated session department is always trusted.
 * The department submitted by the browser is only used when
 * the authenticated user is IT.
 */


/* ============================================================
   READ JSON REQUEST
============================================================ */

$data = json_decode(
    file_get_contents("php://input"),
    true
);

if (!is_array($data)) {

    echo json_encode([
        "status" => "error",
        "message" => "Invalid request data."
    ]);

    exit;
}


$name = trim(
    $data["name"] ?? ""
);

$email = trim(
    $data["email"] ?? ""
);

$password = $data["password"] ?? "";

$role = strtolower(
    trim($data["role"] ?? "")
);

$requestedDepartment = strtoupper(
    trim($data["department"] ?? "")
);


/* ============================================================
   REQUIRED FIELDS
============================================================ */

if (
    $name === "" ||
    $email === "" ||
    $password === "" ||
    $role === ""
) {

    echo json_encode([
        "status" => "error",
        "message" => "Please complete all fields."
    ]);

    exit;
}


/* ============================================================
   VALIDATE ROLE
============================================================ */

$allowedRoles = [
    "admin",
    "staff",
    "dispatcher",
    "supervisor"
];

if (!in_array($role, $allowedRoles, true)) {

    echo json_encode([
        "status" => "error",
        "message" => "Invalid role."
    ]);

    exit;
}


/* ============================================================
   ALLOWED DEPARTMENTS
============================================================ */

$allowedDepartments = [
    "IT",
    "BFP",
    "MCAT",
    "PSTMO"
];


/* ============================================================
   DETERMINE TARGET DEPARTMENT
============================================================ */

/*
 * IT ADMIN
 *
 * IT has permission to create users for ANY department.
 *
 * The requested department from the browser is allowed,
 * but it is still validated against the official department list.
 */

if ($adminDepartment === "IT") {

    if (
        $requestedDepartment === "" ||
        !in_array(
            $requestedDepartment,
            $allowedDepartments,
            true
        )
    ) {

        echo json_encode([
            "status" => "error",
            "message" => "Please select a valid department."
        ]);

        exit;
    }

    $department = $requestedDepartment;
}


/*
 * BFP / MCAT / PSTMO ADMIN
 *
 * These departments are restricted to their own department.
 *
 * The browser-submitted department is completely ignored.
 */

elseif (
    in_array(
        $adminDepartment,
        ["BFP", "MCAT", "PSTMO"],
        true
    )
) {

    $department = $adminDepartment;
}


/*
 * INVALID / EMPTY DEPARTMENT
 *
 * Prevent accounts with an unknown or missing department
 * from creating system users.
 */

else {

    http_response_code(403);

    echo json_encode([
        "status" => "error",
        "message" => "Your account does not have permission to add system users."
    ]);

    exit;
}


/* ============================================================
   FINAL DEPARTMENT SAFETY CHECK
============================================================ */

if (
    !in_array(
        $department,
        $allowedDepartments,
        true
    )
) {

    http_response_code(403);

    echo json_encode([
        "status" => "error",
        "message" => "Invalid target department."
    ]);

    exit;
}


/* ============================================================
   CHECK DUPLICATE EMAIL
============================================================ */

$stmt = $pdo->prepare("
    SELECT
        systemUsersID
    FROM tbl_systemusers
    WHERE email = ?
    LIMIT 1
");

$stmt->execute([
    $email
]);

if ($stmt->fetch()) {

    echo json_encode([
        "status" => "error",
        "message" => "Email already exists."
    ]);

    exit;
}


/* ============================================================
   HASH PASSWORD
============================================================ */

$passwordHash = password_hash(
    $password,
    PASSWORD_DEFAULT
);

if ($passwordHash === false) {

    echo json_encode([
        "status" => "error",
        "message" => "Failed to secure the password."
    ]);

    exit;
}


/* ============================================================
   INSERT USER
============================================================ */

$stmt = $pdo->prepare("
    INSERT INTO tbl_systemusers
    (
        name,
        email,
        passwordHash,
        role,
        department
    )
    VALUES (?, ?, ?, ?, ?)
");

$stmt->execute([
    $name,
    $email,
    $passwordHash,
    $role,
    $department
]);


/* ============================================================
   LOG OPERATION
============================================================ */

$actorID = isset($_SESSION['user_id'])
    ? (int)$_SESSION['user_id']
    : null;

$actorName = $_SESSION['user_name']
    ?? $_SESSION['name']
    ?? 'System Administrator';

logOperation(
    $pdo,
    'system_user',
    $actorID,
    $actorName,
    'Created System User',
    "Created system user '{$name}' ({$email}) with role '{$role}' in department '{$department}'."
);


/* ============================================================
   SUCCESS
============================================================ */

echo json_encode([
    "status" => "success",
    "message" => "User added successfully."
]);
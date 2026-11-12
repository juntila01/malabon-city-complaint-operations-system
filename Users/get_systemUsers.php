<?php

header("Content-Type: application/json; charset=utf-8");

require_once "../Cores/auth.php";
requireRole(['admin', 'staff']);

require_once "../db.php";


/* ============================================================
   AUTHENTICATED ADMIN
============================================================ */

$adminDepartment = strtoupper(
    trim((string) currentDepartment())
);


/* ============================================================
   DEPARTMENT ACCESS
============================================================ */

/*
 * IT = GLOBAL ADMIN
 *
 * IT admins:
 *     Can see all system users.
 *
 * BFP admins:
 *     Can see BFP users only.
 *
 * MCAT admins:
 *     Can see MCAT users only.
 *
 * PSTMO admins:
 *     Can see PSTMO users only.
 *
 * The empty department is also treated as global for
 * backward compatibility with an older main-admin account.
 */

$isMainAdmin =
    in_array(
        $adminDepartment,
        ["", "IT"],
        true
    );


$isDepartmentAdmin =
    in_array(
        $adminDepartment,
        ["BFP", "MCAT", "PSTMO"],
        true
    );


/* ============================================================
   VALIDATE ADMIN DEPARTMENT
============================================================ */

if (
    !$isMainAdmin &&
    !$isDepartmentAdmin
) {

    http_response_code(403);

    echo json_encode([
        "status" => "error",
        "message" =>
            "Your account does not have a valid department."
    ]);

    exit;
}


/* ============================================================
   GET FILTERS
============================================================ */

/*
 * IMPORTANT:
 *
 * This endpoint uses GET.
 *
 * Do NOT use:
 *
 *     json_decode(file_get_contents("php://input"))
 *
 * here.
 *
 * Filters come from $_GET.
 */

$role = trim(
    (string) (
        $_GET["role"] ?? "All"
    )
);

$search = trim(
    (string) (
        $_GET["search"] ?? ""
    )
);

$requestedDepartment = strtoupper(
    trim(
        (string) (
            $_GET["department"] ?? "All"
        )
    )
);


/* ============================================================
   NORMALIZE FILTERS
============================================================ */

if ($role === "") {

    $role = "All";
}


if ($requestedDepartment === "") {

    $requestedDepartment = "All";
}


/* ============================================================
   BUILD QUERY
============================================================ */

try {

    $sql = "
        SELECT
            systemUsersID,
            name,
            email,
            role,
            department
        FROM tbl_systemusers
        WHERE 1 = 1
    ";

    $params = [];


    /* ========================================================
       DEPARTMENT RBAC
    ======================================================== */

    if ($isMainAdmin) {

        /*
         * IT ADMIN
         *
         * IT can see every department.
         *
         * The department filter is optional.
         */

        if (
            $requestedDepartment !== "All" &&
            in_array(
                $requestedDepartment,
                ["BFP", "MCAT", "PSTMO"],
                true
            )
        ) {

            $sql .= "
                AND UPPER(department) = ?
            ";

            $params[] =
                $requestedDepartment;
        }

    } else {

        /*
         * BFP / MCAT / PSTMO ADMIN
         *
         * NEVER trust the browser's department value.
         *
         * The authenticated session determines the scope.
         */

        $sql .= "
            AND UPPER(department) = ?
        ";

        $params[] =
            $adminDepartment;
    }


    /* ========================================================
       ROLE FILTER
    ======================================================== */

    $allowedRoles = [
        "admin",
        "staff",
        "dispatcher",
        "supervisor"
    ];


    if (
        $role !== "All" &&
        in_array(
            strtolower($role),
            $allowedRoles,
            true
        )
    ) {

        $sql .= "
            AND LOWER(role) = ?
        ";

        $params[] =
            strtolower($role);
    }


    /* ========================================================
       SEARCH
    ======================================================== */

    if ($search !== "") {

        $sql .= "
            AND (
                CAST(systemUsersID AS CHAR) LIKE ?
                OR name LIKE ?
                OR email LIKE ?
            )
        ";

        $searchTerm =
            "%" . $search . "%";


        $params[] =
            $searchTerm;

        $params[] =
            $searchTerm;

        $params[] =
            $searchTerm;
    }


    /* ========================================================
       ORDER
    ======================================================== */

    $sql .= "
        ORDER BY systemUsersID DESC
    ";


    /* ========================================================
       EXECUTE
    ======================================================== */

    $stmt =
        $pdo->prepare(
            $sql
        );


    $stmt->execute(
        $params
    );


    $users =
        $stmt->fetchAll(
            PDO::FETCH_ASSOC
        );


    /* ========================================================
       RETURN USERS
    ======================================================== */

    echo json_encode(
        $users
    );

}

catch (PDOException $e) {

    error_log(
        "get_systemUsers.php PDO error: " .
        $e->getMessage()
    );

    http_response_code(500);

    echo json_encode([
        "status" => "error",
        "message" =>
            "Database error while loading system users."
    ]);

}

catch (Throwable $e) {

    error_log(
        "get_systemUsers.php error: " .
        $e->getMessage()
    );

    http_response_code(500);

    echo json_encode([
        "status" => "error",
        "message" =>
            "An error occurred while loading system users."
    ]);
}
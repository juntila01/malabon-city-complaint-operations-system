<?php

header('Content-Type: application/json');

require_once "../db.php";
require_once "../Reports/log_operation.php";


/*
|--------------------------------------------------------------------------
| JSON Response
|--------------------------------------------------------------------------
*/

function jsonResponse(
    bool $success,
    string $message,
    array $extra = []
): void {

    echo json_encode(
        array_merge(
            [
                "success" => $success,
                "message" => $message
            ],
            $extra
        )
    );

    exit;
}


/*
|--------------------------------------------------------------------------
| Only POST
|--------------------------------------------------------------------------
*/

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {

    http_response_code(405);

    jsonResponse(
        false,
        "Invalid request method."
    );
}


/*
|--------------------------------------------------------------------------
| Get Request
|--------------------------------------------------------------------------
*/

$action =
    $_POST['action'] ?? '';

$rawToken =
    trim($_POST['token'] ?? '');


/*
|--------------------------------------------------------------------------
| Validate Token
|--------------------------------------------------------------------------
*/

if ($rawToken === '') {

    jsonResponse(
        false,
        "Password reset token is missing."
    );
}


/*
|--------------------------------------------------------------------------
| Hash Token
|--------------------------------------------------------------------------
*/

$tokenHash =
    hash(
        'sha256',
        $rawToken
    );


try {

    /*
    |--------------------------------------------------------------------------
    | Find Token
    |--------------------------------------------------------------------------
    */

    $stmt = $pdo->prepare("
        SELECT
            resetID,
            userType,
            userID,
            email,
            expiresAt
        FROM tbl_password_resets
        WHERE tokenHash = :tokenHash
        LIMIT 1
    ");

    $stmt->execute([
        ':tokenHash' => $tokenHash
    ]);

    $reset =
        $stmt->fetch(PDO::FETCH_ASSOC);


    /*
    |--------------------------------------------------------------------------
    | Token Not Found
    |--------------------------------------------------------------------------
    */

    if (!$reset) {

        jsonResponse(
            false,
            "This password reset link is invalid or has already been used."
        );
    }


    /*
    |--------------------------------------------------------------------------
    | Check Expiration
    |--------------------------------------------------------------------------
    */

    if (
        strtotime($reset['expiresAt'])
        <= time()
    ) {

        /*
        | Delete expired token
        */

        $delete =
            $pdo->prepare("
                DELETE FROM tbl_password_resets
                WHERE resetID = :resetID
            ");

        $delete->execute([
            ':resetID' => $reset['resetID']
        ]);


        jsonResponse(
            false,
            "This password reset link has expired. Please request a new one."
        );
    }


    /*
    |--------------------------------------------------------------------------
    | VALIDATE ACTION
    |--------------------------------------------------------------------------
    */

    if ($action === 'validate') {

        $account = null;


        /*
        |----------------------------------------------------------------------
        | Citizen
        |----------------------------------------------------------------------
        */

        if ($reset['userType'] === 'citizen') {

            $stmt = $pdo->prepare("
                SELECT
                    citizenID AS userID,
                    fullName AS displayName,
                    email
                FROM tbl_citizens
                WHERE citizenID = :userID
                LIMIT 1
            ");

            $stmt->execute([
                ':userID' => $reset['userID']
            ]);

            $account =
                $stmt->fetch(PDO::FETCH_ASSOC);
        }


        /*
        |----------------------------------------------------------------------
        | System User
        |----------------------------------------------------------------------
        */

        elseif ($reset['userType'] === 'system') {

            $stmt = $pdo->prepare("
                SELECT
                    systemUsersID AS userID,
                    name AS displayName,
                    email
                FROM tbl_systemusers
                WHERE systemUsersID = :userID
                LIMIT 1
            ");

            $stmt->execute([
                ':userID' => $reset['userID']
            ]);

            $account =
                $stmt->fetch(PDO::FETCH_ASSOC);
        }


        /*
        |----------------------------------------------------------------------
        | Dispatch Team
        |----------------------------------------------------------------------
        */

        elseif ($reset['userType'] === 'dispatchteam') {

            $stmt = $pdo->prepare("
                SELECT
                    teamID AS userID,
                    teamName AS displayName,
                    email
                FROM tbl_dispatch_teams
                WHERE teamID = :userID
                LIMIT 1
            ");

            $stmt->execute([
                ':userID' => $reset['userID']
            ]);

            $account =
                $stmt->fetch(PDO::FETCH_ASSOC);
        }


        /*
        |----------------------------------------------------------------------
        | Unknown Account Type
        |----------------------------------------------------------------------
        */

        else {

            jsonResponse(
                false,
                "Invalid account type."
            );
        }


        /*
        |----------------------------------------------------------------------
        | Account No Longer Exists
        |----------------------------------------------------------------------
        */

        if (!$account) {

            jsonResponse(
                false,
                "The account associated with this reset link no longer exists."
            );
        }


        /*
        |----------------------------------------------------------------------
        | Return Safe Account Information
        |----------------------------------------------------------------------
        */

        jsonResponse(
            true,
            "Reset link is valid.",
            [
                "account" => [
                    "displayName" =>
                        $account['displayName'],

                    "email" =>
                        $account['email']
                ]
            ]
        );
    }


    /*
    |--------------------------------------------------------------------------
    | RESET PASSWORD
    |--------------------------------------------------------------------------
    */

    if ($action === 'reset') {

        $password =
            $_POST['password'] ?? '';


        /*
        |----------------------------------------------------------------------
        | Basic Password Validation
        |----------------------------------------------------------------------
        */

        if ($password === '') {

            jsonResponse(
                false,
                "Password is required."
            );
        }


        /*
        |----------------------------------------------------------------------
        | Password Requirements
        |----------------------------------------------------------------------
        */

        if (strlen($password) < 8) {

            jsonResponse(
                false,
                "Password must contain at least 8 characters."
            );
        }

        if (!preg_match('/[A-Z]/', $password)) {

            jsonResponse(
                false,
                "Password must contain at least one uppercase letter."
            );
        }

        if (!preg_match('/[a-z]/', $password)) {

            jsonResponse(
                false,
                "Password must contain at least one lowercase letter."
            );
        }

        if (!preg_match('/[0-9]/', $password)) {

            jsonResponse(
                false,
                "Password must contain at least one number."
            );
        }

        if (!preg_match('/[^A-Za-z0-9]/', $password)) {

            jsonResponse(
                false,
                "Password must contain at least one special character."
            );
        }


        /*
        |----------------------------------------------------------------------
        | Hash New Password
        |----------------------------------------------------------------------
        */

        $passwordHash =
            password_hash(
                $password,
                PASSWORD_DEFAULT
            );


        /*
        |----------------------------------------------------------------------
        | Start Transaction
        |----------------------------------------------------------------------
        */

        $pdo->beginTransaction();


        try {

            /*
            |------------------------------------------------------------------
            | Update Citizen
            |------------------------------------------------------------------
            */

            if ($reset['userType'] === 'citizen') {

                $stmt = $pdo->prepare("
                    UPDATE tbl_citizens
                    SET passwordHash = :passwordHash
                    WHERE citizenID = :userID
                ");

            }


            /*
            |------------------------------------------------------------------
            | Update System User
            |------------------------------------------------------------------
            */

            elseif ($reset['userType'] === 'system') {

                $stmt = $pdo->prepare("
                    UPDATE tbl_systemusers
                    SET passwordHash = :passwordHash
                    WHERE systemUsersID = :userID
                ");

            }


            /*
            |------------------------------------------------------------------
            | Update Dispatch Team
            |------------------------------------------------------------------
            */

            elseif ($reset['userType'] === 'dispatchteam') {

                $stmt = $pdo->prepare("
                    UPDATE tbl_dispatch_teams
                    SET passwordHash = :passwordHash
                    WHERE teamID = :userID
                ");

            }


            /*
            |------------------------------------------------------------------
            | Invalid Type
            |------------------------------------------------------------------
            */

            else {

                throw new Exception(
                    "Invalid account type."
                );
            }


            /*
            |------------------------------------------------------------------
            | Execute Update
            |------------------------------------------------------------------
            */

            $stmt->execute([
                ':passwordHash' =>
                    $passwordHash,

                ':userID' =>
                    $reset['userID']
            ]);


            /*
            |------------------------------------------------------------------
            | Make Sure Account Was Updated
            |------------------------------------------------------------------
            */

            if ($stmt->rowCount() === 0) {

                throw new Exception(
                    "Account password could not be updated."
                );
            }


            /*
            |------------------------------------------------------------------
            | Delete Used Token
            |------------------------------------------------------------------
            */

            $stmt = $pdo->prepare("
                DELETE FROM tbl_password_resets
                WHERE resetID = :resetID
            ");

            $stmt->execute([
                ':resetID' =>
                    $reset['resetID']
            ]);

            /*
            |------------------------------------------------------------------
            | OPERATIONAL LOG
            |------------------------------------------------------------------
            */

            $actorType = $reset['userType'];

            $actorName = $reset['email'];

            logOperation(
                $pdo,
                $actorType,
                (int) $reset['userID'],
                $actorName,
                'Password Reset',
                "Password was successfully reset for {$reset['email']}.",
                null,
                null,
                'Password Reset'
            );


            /*
            |------------------------------------------------------------------
            | Commit
            |------------------------------------------------------------------
            */

            $pdo->commit();


            /*
            |------------------------------------------------------------------
            | Success
            |------------------------------------------------------------------
            */

            jsonResponse(
                true,
                "Your password has been reset successfully."
            );


        } catch (Exception $e) {

            /*
            |------------------------------------------------------------------
            | Rollback
            |------------------------------------------------------------------
            */

            if ($pdo->inTransaction()) {

                $pdo->rollBack();
            }


            error_log(
                "Password reset update error: " .
                $e->getMessage()
            );


            jsonResponse(
                false,
                "Unable to reset the password. Please try again."
            );
        }
    }


    /*
    |--------------------------------------------------------------------------
    | Invalid Action
    |--------------------------------------------------------------------------
    */

    jsonResponse(
        false,
        "Invalid password reset request."
    );


} catch (PDOException $e) {

    error_log(
        "Password reset database error: " .
        $e->getMessage()
    );


    jsonResponse(
        false,
        "A database error occurred. Please try again later."
    );
}
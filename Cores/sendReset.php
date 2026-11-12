<?php

header('Content-Type: application/json');

require_once "../db.php";

require_once "../PHPMailer/src/Exception.php";
require_once "../PHPMailer/src/PHPMailer.php";
require_once "../PHPMailer/src/SMTP.php";

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;


/*
|--------------------------------------------------------------------------
| Configuration
|--------------------------------------------------------------------------
*/

$mailConfig = require_once "mail_config.php";


/*
|--------------------------------------------------------------------------
| JSON Response Helper
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
| Only Accept POST
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
| Get Email
|--------------------------------------------------------------------------
*/

$email = trim($_POST['email'] ?? '');


/*
|--------------------------------------------------------------------------
| Validate Email
|--------------------------------------------------------------------------
*/

if ($email === '') {

    jsonResponse(
        false,
        "Email is required."
    );
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {

    jsonResponse(
        false,
        "Invalid email format."
    );
}


/*
|--------------------------------------------------------------------------
| Find Account
|--------------------------------------------------------------------------
*/

try {

    $accounts = [];


    /*
    |--------------------------------------------------------------------------
    | 1. Search Citizens
    |--------------------------------------------------------------------------
    */

    $stmt = $pdo->prepare("
        SELECT
            citizenID AS userID,
            fullName AS displayName,
            email
        FROM tbl_citizens
        WHERE email = :email
        LIMIT 1
    ");

    $stmt->execute([
        ':email' => $email
    ]);

    $citizen = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($citizen) {

        $accounts[] = [
            'userType' => 'citizen',
            'userID' => (int) $citizen['userID'],
            'email' => $citizen['email'],
            'displayName' => $citizen['displayName']
        ];
    }


    /*
    |--------------------------------------------------------------------------
    | 2. Search System Users
    |--------------------------------------------------------------------------
    */

    $stmt = $pdo->prepare("
        SELECT
            systemUsersID AS userID,
            name AS displayName,
            email,
            role
        FROM tbl_systemusers
        WHERE email = :email
        LIMIT 1
    ");

    $stmt->execute([
        ':email' => $email
    ]);

    $systemUser = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($systemUser) {

        $accounts[] = [
            'userType' => 'system',
            'userID' => (int) $systemUser['userID'],
            'email' => $systemUser['email'],
            'displayName' => $systemUser['displayName'],
            'role' => $systemUser['role']
        ];
    }


    /*
    |--------------------------------------------------------------------------
    | 3. Search Dispatch Teams
    |--------------------------------------------------------------------------
    */

    $stmt = $pdo->prepare("
        SELECT
            teamID AS userID,
            teamName AS displayName,
            email,
            department
        FROM tbl_dispatch_teams
        WHERE email = :email
        LIMIT 1
    ");

    $stmt->execute([
        ':email' => $email
    ]);

    $dispatchTeam = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($dispatchTeam) {

        $accounts[] = [
            'userType' => 'dispatchteam',
            'userID' => (int) $dispatchTeam['userID'],
            'email' => $dispatchTeam['email'],
            'displayName' => $dispatchTeam['displayName'],
            'department' => $dispatchTeam['department']
        ];
    }


    /*
    |--------------------------------------------------------------------------
    | No Account Found
    |--------------------------------------------------------------------------
    */

    if (empty($accounts)) {

        jsonResponse(
            true,
            "If an account with that email address exists, you will receive a password reset link shortly. Please check your inbox and spam folder."
        );
    }


    /*
    |--------------------------------------------------------------------------
    | Multiple Accounts
    |--------------------------------------------------------------------------
    */

    if (count($accounts) > 1) {

    error_log(
        "Password reset request matched multiple accounts for email: " .
        hash('sha256', strtolower($email))
    );

    jsonResponse(
        true,
        "If an account with that email address exists, you will receive a password reset link shortly. Please check your inbox and spam folder."
    );
}


    /*
    |--------------------------------------------------------------------------
    | Get Account
    |--------------------------------------------------------------------------
    */

    $account = $accounts[0];

    $userType = $account['userType'];
    $userID = $account['userID'];
    $displayName = $account['displayName'];


    /*
    |--------------------------------------------------------------------------
    | Delete Previous Reset Tokens
    |--------------------------------------------------------------------------
    */

    $stmt = $pdo->prepare("
        DELETE FROM tbl_password_resets
        WHERE userType = :userType
        AND userID = :userID
    ");

    $stmt->execute([
        ':userType' => $userType,
        ':userID' => $userID
    ]);


    /*
    |--------------------------------------------------------------------------
    | Generate Secure Token
    |--------------------------------------------------------------------------
    |
    | This is the token that goes into the email link.
    |
    */

    $rawToken = bin2hex(
        random_bytes(32)
    );


    /*
    |--------------------------------------------------------------------------
    | Hash Token Before Database Storage
    |--------------------------------------------------------------------------
    */

    $tokenHash = hash(
        'sha256',
        $rawToken
    );


    /*
    |--------------------------------------------------------------------------
    | Token Expiration
    |--------------------------------------------------------------------------
    |
    | Token is valid for 15 minutes.
    |
    */

    $expiresAt = date(
        'Y-m-d H:i:s',
        time() + (15 * 60)
    );


    /*
    |--------------------------------------------------------------------------
    | Save Reset Token
    |--------------------------------------------------------------------------
    */

    $stmt = $pdo->prepare("
        INSERT INTO tbl_password_resets
        (
            userType,
            userID,
            email,
            tokenHash,
            expiresAt,
            createdAt
        )
        VALUES
        (
            :userType,
            :userID,
            :email,
            :tokenHash,
            :expiresAt,
            NOW()
        )
    ");

    $stmt->execute([
        ':userType' => $userType,
        ':userID' => $userID,
        ':email' => $email,
        ':tokenHash' => $tokenHash,
        ':expiresAt' => $expiresAt
    ]);


    /*
    |--------------------------------------------------------------------------
    | Build Reset URL
    |--------------------------------------------------------------------------
    |
    | Works on:
    |
    | XAMPP:
    | http://localhost/Complaint/...
    |
    | InfinityFree:
    | https://yourdomain...
    |
    */

    $https = (
        isset($_SERVER['HTTPS']) &&
        $_SERVER['HTTPS'] !== 'off'
    );

    $protocol = $https ? 'https' : 'http';

    $host = $_SERVER['HTTP_HOST'] ?? 'localhost';


    /*
    |--------------------------------------------------------------------------
    | Detect Project Folder
    |--------------------------------------------------------------------------
    */

    $scriptDirectory = dirname(
        $_SERVER['SCRIPT_NAME']
    );

    $resetUrl =
        $protocol .
        '://' .
        $host .
        $scriptDirectory .
        '/reset_password.html?token=' .
        urlencode($rawToken);


    /*
    |--------------------------------------------------------------------------
    | Send Email Using PHPMailer
    |--------------------------------------------------------------------------
    */

    $mail = new PHPMailer(true);

    try {

        /*
        |--------------------------------------------------------------------------
        | SMTP Configuration
        |--------------------------------------------------------------------------
        */

        $mail->isSMTP();

        $mail->Host = 'smtp.gmail.com';

        $mail->SMTPAuth = true;

        $mail->Username =
            $mailConfig['username'];

        $mail->Password =
            $mailConfig['password'];

        $mail->SMTPSecure =
            PHPMailer::ENCRYPTION_STARTTLS;

        $mail->Port = 587;


        /*
        |--------------------------------------------------------------------------
        | Sender
        |--------------------------------------------------------------------------
        */

        $mail->setFrom(
            $mailConfig['from_email'],
            $mailConfig['from_name']
        );


        /*
        |--------------------------------------------------------------------------
        | Recipient
        |--------------------------------------------------------------------------
        */

        $mail->addAddress(
            $email,
            $displayName
        );


        /*
        |--------------------------------------------------------------------------
        | Email Content
        |--------------------------------------------------------------------------
        */

        $mail->isHTML(true);

        $mail->Subject =
            'Password Reset - MCAT Complaint Management System';


        $mail->Body = "
            <!DOCTYPE html>

            <html>

            <body style='
                font-family: Arial, sans-serif;
                background: #f3f4f6;
                padding: 30px;
            '>

                <div style='
                    max-width: 600px;
                    margin: auto;
                    background: white;
                    padding: 35px;
                    border-radius: 12px;
                '>

                    <h2 style='
                        color: #2563eb;
                    '>
                        Password Reset
                    </h2>

                    <p>
                        Hello " .
                        htmlspecialchars($displayName) .
                        ",
                    </p>

                    <p>
                        We received a request to reset
                        the password for your MCAT
                        Complaint Management System account.
                    </p>

                    <p>
                        Click the button below to create
                        a new password:
                    </p>

                    <div style='
                        text-align: center;
                        margin: 30px 0;
                    '>

                        <a href='" .
                            htmlspecialchars($resetUrl) .
                        "' style='
                            display: inline-block;
                            background: #2563eb;
                            color: white;
                            padding: 14px 25px;
                            text-decoration: none;
                            border-radius: 8px;
                            font-weight: bold;
                        '>
                            Reset My Password
                        </a>

                    </div>

                    <p>
                        This password reset link will
                        expire in <strong>15 minutes</strong>.
                    </p>

                    <p>
                        If you did not request a password
                        reset, you can safely ignore this email.
                    </p>

                    <hr>

                    <p style='
                        color: #9ca3af;
                        font-size: 12px;
                    '>
                        MCAT Complaint Management System
                    </p>

                </div>

            </body>

            </html>
        ";


        /*
        |--------------------------------------------------------------------------
        | Plain Text Version
        |--------------------------------------------------------------------------
        */

        $mail->AltBody =
            "Password Reset\n\n" .
            "Hello {$displayName},\n\n" .
            "Use the following link to reset your password:\n\n" .
            $resetUrl .
            "\n\n" .
            "This link expires in 15 minutes.";


        /*
        |--------------------------------------------------------------------------
        | Send
        |--------------------------------------------------------------------------
        */

        $mail->send();


    } catch (Exception $e) {

        /*
        |--------------------------------------------------------------------------
        | Email Failed
        |--------------------------------------------------------------------------
        */

        error_log(
            "PHPMailer Error: " .
            $mail->ErrorInfo
        );


        /*
        |--------------------------------------------------------------------------
        | Remove Token If Email Failed
        |--------------------------------------------------------------------------
        */

        $stmt = $pdo->prepare("
            DELETE FROM tbl_password_resets
            WHERE userType = :userType
            AND userID = :userID
            AND tokenHash = :tokenHash
        ");

        $stmt->execute([
            ':userType' => $userType,
            ':userID' => $userID,
            ':tokenHash' => $tokenHash
        ]);


        jsonResponse(
            false,
            "PHPMailer Error: " . $mail->ErrorInfo
        );
    }


    /*
    |--------------------------------------------------------------------------
    | Success
    |--------------------------------------------------------------------------
    */

    jsonResponse(
    true,
   "If an account with that email address exists, you will receive a password reset link shortly. Please check your inbox and spam folder."
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
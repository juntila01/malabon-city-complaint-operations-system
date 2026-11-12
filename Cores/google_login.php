<?php

error_reporting(E_ALL);
ini_set('display_errors', 1);

session_start();

header("Content-Type: application/json");

require_once "../db.php";
require_once "../Reports/log_operation.php";


/* =========================================================
   GOOGLE CLIENT ID
   ========================================================= */

const GOOGLE_CLIENT_ID = '964361808717-6k3d0petdsj3v3c2kqlvjqabv9fhefjj.apps.googleusercontent.com';


/* =========================================================
   JSON RESPONSE
   ========================================================= */

function jsonResponse(array $data, int $statusCode = 200): void
{
    http_response_code($statusCode);
    echo json_encode($data);
    exit;
}


/* =========================================================
   BASE64URL DECODER
   ========================================================= */

function base64UrlDecode(string $data): string|false
{
    $remainder = strlen($data) % 4;

    if ($remainder) {
        $data .= str_repeat('=', 4 - $remainder);
    }

    return base64_decode(
        strtr($data, '-_', '+/')
    );
}


/* =========================================================
   GET GOOGLE PUBLIC CERTIFICATES
   ========================================================= */

function getGoogleCertificates(): array
{
    $url = 'https://www.googleapis.com/oauth2/v1/certs';

    $ch = curl_init($url);

    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 10,
        CURLOPT_CONNECTTIMEOUT => 5,
        CURLOPT_SSL_VERIFYPEER => true,
        CURLOPT_SSL_VERIFYHOST => 2,
        CURLOPT_HTTPHEADER => [
            'Accept: application/json'
        ]
    ]);

    $response = curl_exec($ch);

    if ($response === false) {
        $error = curl_error($ch);
        curl_close($ch);

        throw new Exception(
            'Unable to contact Google certificate server: ' . $error
        );
    }

    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

    curl_close($ch);

    if ($httpCode !== 200) {
        throw new Exception(
            'Google certificate server returned HTTP ' . $httpCode
        );
    }

    $certificates = json_decode($response, true);

    if (!is_array($certificates)) {
        throw new Exception(
            'Invalid response from Google certificate server.'
        );
    }

    return $certificates;
}


/* =========================================================
   VERIFY GOOGLE ID TOKEN
   ========================================================= */

function verifyGoogleIdToken(string $idToken): array|false
{
    $parts = explode('.', $idToken);

    if (count($parts) !== 3) {
        return false;
    }

    [$encodedHeader, $encodedPayload, $encodedSignature] = $parts;

    $headerJson = base64UrlDecode($encodedHeader);
    $payloadJson = base64UrlDecode($encodedPayload);
    $signature = base64UrlDecode($encodedSignature);

    if (
        $headerJson === false ||
        $payloadJson === false ||
        $signature === false
    ) {
        return false;
    }

    $header = json_decode($headerJson, true);
    $payload = json_decode($payloadJson, true);

    if (
        !is_array($header) ||
        !is_array($payload)
    ) {
        return false;
    }


    /* ---------------------------------------------------------
       CHECK JWT ALGORITHM
       --------------------------------------------------------- */

    if (
        !isset($header['alg']) ||
        $header['alg'] !== 'RS256'
    ) {
        return false;
    }


    /* ---------------------------------------------------------
       CHECK KEY ID
       --------------------------------------------------------- */

    if (
        !isset($header['kid']) ||
        empty($header['kid'])
    ) {
        return false;
    }


    /* ---------------------------------------------------------
       GET GOOGLE CERTIFICATES
       --------------------------------------------------------- */

    try {
        $certificates = getGoogleCertificates();
    } catch (Exception $e) {
        return false;
    }

    $kid = $header['kid'];

    if (!isset($certificates[$kid])) {
        return false;
    }

    $certificate = $certificates[$kid];


    /* ---------------------------------------------------------
       VERIFY SIGNATURE
       --------------------------------------------------------- */

    $publicKey = openssl_pkey_get_public($certificate);

    if ($publicKey === false) {
        return false;
    }

    $signedData = $encodedHeader . '.' . $encodedPayload;

    $signatureResult = openssl_verify(
        $signedData,
        $signature,
        $publicKey,
        OPENSSL_ALGO_SHA256
    );

    if ($signatureResult !== 1) {
        return false;
    }


    /* ---------------------------------------------------------
       CHECK ISSUER
       --------------------------------------------------------- */

    $validIssuers = [
        'https://accounts.google.com',
        'accounts.google.com'
    ];

    if (
        !isset($payload['iss']) ||
        !in_array($payload['iss'], $validIssuers, true)
    ) {
        return false;
    }


    /* ---------------------------------------------------------
       CHECK AUDIENCE
       --------------------------------------------------------- */

    if (
        !isset($payload['aud']) ||
        $payload['aud'] !== GOOGLE_CLIENT_ID
    ) {
        return false;
    }


    /* ---------------------------------------------------------
       CHECK EXPIRATION
       --------------------------------------------------------- */

    if (
        !isset($payload['exp']) ||
        !is_numeric($payload['exp']) ||
        (int)$payload['exp'] < time()
    ) {
        return false;
    }


    /* ---------------------------------------------------------
       CHECK ISSUED-AT TIME
       --------------------------------------------------------- */

    if (
        isset($payload['iat']) &&
        is_numeric($payload['iat']) &&
        (int)$payload['iat'] > time() + 300
    ) {
        return false;
    }


    /* ---------------------------------------------------------
       CHECK GOOGLE ACCOUNT ID
       --------------------------------------------------------- */

    if (
        !isset($payload['sub']) ||
        trim((string)$payload['sub']) === ''
    ) {
        return false;
    }


    /* ---------------------------------------------------------
       CHECK EMAIL
       --------------------------------------------------------- */

    if (
        !isset($payload['email']) ||
        !filter_var($payload['email'], FILTER_VALIDATE_EMAIL)
    ) {
        return false;
    }


    /* ---------------------------------------------------------
       CHECK EMAIL VERIFICATION
       --------------------------------------------------------- */

    if (
        !isset($payload['email_verified']) ||
        $payload['email_verified'] !== true
    ) {
        return false;
    }


    return $payload;
}


/* =========================================================
   ONLY POST REQUESTS
   ========================================================= */

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse([
        'success' => false,
        'message' => 'Invalid request method.'
    ], 405);
}


/* =========================================================
   GET GOOGLE CREDENTIAL
   ========================================================= */

$credential = trim($_POST['credential'] ?? '');

if ($credential === '') {
    jsonResponse([
        'success' => false,
        'message' => 'Google credential was not provided.'
    ], 400);
}


/* =========================================================
   VERIFY GOOGLE TOKEN
   ========================================================= */

$googlePayload = verifyGoogleIdToken($credential);

if ($googlePayload === false) {
    jsonResponse([
        'success' => false,
        'message' => 'Invalid or expired Google authentication.'
    ], 401);
}


/* =========================================================
   GOOGLE ACCOUNT INFORMATION
   ========================================================= */

$googleID = trim((string)$googlePayload['sub']);

$email = strtolower(
    trim((string)$googlePayload['email'])
);


/* =========================================================
   FIND GOOGLE ACCOUNT
   ========================================================= */

try {

    $sql = "
        SELECT
            citizenID,
            fullName,
            email,
            verificationStatus,
            authProvider,
            googleID
        FROM tbl_citizens
        WHERE googleID = :googleID
        LIMIT 1
    ";

    $stmt = $pdo->prepare($sql);

    $stmt->execute([
        ':googleID' => $googleID
    ]);

    $citizen = $stmt->fetch(PDO::FETCH_ASSOC);


    /* =====================================================
       GOOGLE ACCOUNT NOT FOUND
       ===================================================== */

    if (!$citizen) {

        /*
         * Do NOT automatically convert an existing
         * local account just because its email matches.
         */

        $emailCheck = $pdo->prepare("
            SELECT citizenID, authProvider
            FROM tbl_citizens
            WHERE email = :email
            LIMIT 1
        ");

        $emailCheck->execute([
            ':email' => $email
        ]);

        $existingEmailAccount = $emailCheck->fetch(
            PDO::FETCH_ASSOC
        );


        if ($existingEmailAccount) {

            jsonResponse([
                'success' => false,
                'message' =>
                    'An account with this email already exists. Please use your existing login method.'
            ], 409);
        }


        /*
         * Google account does not exist yet.
         *
         * This is intentionally NOT registered here.
         * Registration belongs to google_signup.php.
         */

        jsonResponse([
            'success' => false,
            'message' =>
                'This Google account is not registered in Malabon CitizenCare. Please use Sign up with Google first.'
        ], 404);
    }


    /* =====================================================
       VERIFY ACCOUNT TYPE
       ===================================================== */

    if (
        isset($citizen['authProvider']) &&
        $citizen['authProvider'] !== 'google'
    ) {

        jsonResponse([
            'success' => false,
            'message' =>
                'This account uses regular email and password login.'
        ], 409);
    }


    /* =====================================================
       CREATE SAME SESSION AS NORMAL CITIZEN LOGIN
       ===================================================== */

    session_regenerate_id(true);

    $_SESSION['login_attempts'] = 0;
    $_SESSION['lock_until'] = 0;

    $_SESSION['user_id'] =
        (int)$citizen['citizenID'];

    $_SESSION['user_email'] =
        $citizen['email'];

    $_SESSION['user_role'] =
        'citizen';

    $_SESSION['user_type'] =
        'citizen';

    $_SESSION['verification_status'] =
        $citizen['verificationStatus'];

    $_SESSION['logged_in'] =
        true;


    /* =====================================================
       LOG LOGIN
       ===================================================== */

    logOperation(
        $pdo,
        'citizen',
        (int)$citizen['citizenID'],
        $citizen['email'],
        'Login',
        'Citizen logged into the system using Google authentication.'
    );


    /* =====================================================
       SUCCESS
       ===================================================== */

    jsonResponse([
        'success' => true,
        'action' => 'login',
        'redirect' => '../Citizens/citizen.php'
    ]);


} catch (PDOException $e) {

    error_log(
        'Google login database error: ' . $e->getMessage()
    );

    jsonResponse([
        'success' => false,
        'message' => 'Database connection or query failed.'
    ], 500);

} catch (Throwable $e) {

    error_log(
        'Google login error: ' . $e->getMessage()
    );

    jsonResponse([
        'success' => false,
        'message' => 'Unable to complete Google login.'
    ], 500);
}
?>
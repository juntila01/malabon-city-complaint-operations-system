<?php

session_start();

header("Content-Type: application/json");

require_once "../db.php";
require_once "../Reports/log_operation.php";

/*
|--------------------------------------------------------------------------
| GOOGLE CONFIGURATION
|--------------------------------------------------------------------------
|
| Replace this with the Web Client ID from Google Cloud.
|
*/

const GOOGLE_CLIENT_ID = '964361808717-6k3d0petdsj3v3c2kqlvjqabv9fhefjj.apps.googleusercontent.com';


/*
|--------------------------------------------------------------------------
| JSON RESPONSE HELPER
|--------------------------------------------------------------------------
*/

function jsonResponse(bool $success, string $message = '', array $data = []): void
{
    echo json_encode(array_merge([
        'success' => $success,
        'message' => $message
    ], $data));

    exit();
}


/*
|--------------------------------------------------------------------------
| GOOGLE TOKEN HELPERS
|--------------------------------------------------------------------------
*/

/**
 * Decode a Base64URL string.
 */
function base64UrlDecode(string $data): string|false
{
    $remainder = strlen($data) % 4;

    if ($remainder > 0) {
        $data .= str_repeat('=', 4 - $remainder);
    }

    return base64_decode(
        strtr($data, '-_', '+/'),
        true
    );
}


/**
 * Download Google's current public certificates.
 *
 * Google rotates these certificates, so we retrieve the current
 * certificates rather than hard-coding them.
 */
function getGoogleCertificates(): array|false
{
    $url = 'https://www.googleapis.com/oauth2/v1/certs';

    $ch = curl_init($url);

    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 10,
        CURLOPT_CONNECTTIMEOUT => 5,
        CURLOPT_SSL_VERIFYPEER => true,
        CURLOPT_SSL_VERIFYHOST => 2,
        CURLOPT_USERAGENT => 'MalabonCitizenCare-GoogleAuth'
    ]);

    $response = curl_exec($ch);

    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

    curl_close($ch);

    if ($response === false || $httpCode !== 200) {
        return false;
    }

    $certificates = json_decode($response, true);

    if (!is_array($certificates)) {
        return false;
    }

    return $certificates;
}


/**
 * Verify Google's JWT ID token.
 *
 * This checks:
 * - JWT structure
 * - Google signing certificate
 * - RS256 signature
 * - issuer
 * - audience
 * - expiration
 * - issued-at time
 */
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

    if (!is_array($header) || !is_array($payload)) {
        return false;
    }

    /*
     * Google Identity Services uses RS256.
     */
    if (($header['alg'] ?? '') !== 'RS256') {
        return false;
    }

    $kid = $header['kid'] ?? '';

    if ($kid === '') {
        return false;
    }

    /*
     * Retrieve Google's current certificates.
     */
    $certificates = getGoogleCertificates();

    if ($certificates === false) {
        return false;
    }

    if (!isset($certificates[$kid])) {
        return false;
    }

    $certificate = $certificates[$kid];

    /*
     * Verify JWT signature.
     */
    $signedData = $encodedHeader . '.' . $encodedPayload;

    $verificationResult = openssl_verify(
        $signedData,
        $signature,
        $certificate,
        OPENSSL_ALGO_SHA256
    );

    if ($verificationResult !== 1) {
        return false;
    }

    /*
     * Verify issuer.
     */
    $issuer = $payload['iss'] ?? '';

    if (
        $issuer !== 'https://accounts.google.com' &&
        $issuer !== 'accounts.google.com'
    ) {
        return false;
    }

    /*
     * Verify audience.
     */
    if (($payload['aud'] ?? '') !== GOOGLE_CLIENT_ID) {
        return false;
    }

    /*
     * Verify expiration.
     */
    if (!isset($payload['exp']) || !is_numeric($payload['exp'])) {
        return false;
    }

    if ((int)$payload['exp'] < time()) {
        return false;
    }

    /*
     * Verify issued-at time.
     *
     * Allow a small amount of clock difference.
     */
    if (isset($payload['iat']) && is_numeric($payload['iat'])) {

        $issuedAt = (int)$payload['iat'];

        if ($issuedAt > time() + 300) {
            return false;
        }
    }

    /*
     * Required Google identity fields.
     */
    if (
        empty($payload['sub']) ||
        empty($payload['email'])
    ) {
        return false;
    }

    /*
     * The email should be verified.
     */
    if (
        !isset($payload['email_verified']) ||
        $payload['email_verified'] !== true
    ) {
        return false;
    }

    return $payload;
}


/*
|--------------------------------------------------------------------------
| REQUEST METHOD
|--------------------------------------------------------------------------
*/

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, 'Invalid request method.');
}


/*
|--------------------------------------------------------------------------
| ACTION
|--------------------------------------------------------------------------
*/

$action = $_POST['action'] ?? 'verify';


/*
|--------------------------------------------------------------------------
| ACTION: VERIFY GOOGLE ACCOUNT
|--------------------------------------------------------------------------
*/

if ($action === 'verify') {

    $credential = trim($_POST['credential'] ?? '');

    if ($credential === '') {
        jsonResponse(false, 'Google credential was not provided.');
    }

    /*
     * Verify the ID token.
     */
    $googleUser = verifyGoogleIdToken($credential);

    if ($googleUser === false) {
        jsonResponse(
            false,
            'Google authentication could not be verified. Please try again.'
        );
    }

    /*
     * Extract verified Google information.
     */
    $googleID = trim($googleUser['sub']);
    $email = strtolower(trim($googleUser['email']));

    $fullName = trim(
        $googleUser['name']
        ?? trim(
            ($googleUser['given_name'] ?? '') . ' ' .
            ($googleUser['family_name'] ?? '')
        )
    );

    $profileImage = trim($googleUser['picture'] ?? '');

    /*
     * Save the verified Google identity temporarily in the session.
     *
     * We do NOT trust the browser to send this information back later.
     */
    $_SESSION['google_signup_pending'] = [
        'googleID' => $googleID,
        'email' => $email,
        'fullName' => $fullName,
        'profileImage' => $profileImage,
        'createdAt' => time()
    ];

    /*
     * Remove old pending Google information after 10 minutes.
     */
    if (
        !isset($_SESSION['google_signup_pending']['createdAt']) ||
        (time() - $_SESSION['google_signup_pending']['createdAt']) > 600
    ) {
        unset($_SESSION['google_signup_pending']);

        jsonResponse(
            false,
            'Google signup session expired. Please try again.'
        );
    }

    try {

        /*
         * ------------------------------------------------------------
         * Check by Google ID first.
         * ------------------------------------------------------------
         */

        $sqlGoogle = "
            SELECT
                citizenID,
                fullName,
                email,
                authProvider,
                verificationStatus,
                profileImage
            FROM tbl_citizens
            WHERE googleID = :googleID
            LIMIT 1
        ";

        $stmtGoogle = $pdo->prepare($sqlGoogle);

        $stmtGoogle->execute([
            ':googleID' => $googleID
        ]);

        $existingGoogleUser = $stmtGoogle->fetch(PDO::FETCH_ASSOC);

        if ($existingGoogleUser) {

            /*
             * Existing Google account.
             *
             * Log the citizen in.
             */

            session_regenerate_id(true);

            $_SESSION['logged_in'] = true;
            $_SESSION['user_type'] = 'citizen';
            $_SESSION['citizenID'] = (int)$existingGoogleUser['citizenID'];
            $_SESSION['email'] = $existingGoogleUser['email'];
            $_SESSION['fullName'] = $existingGoogleUser['fullName'];

            unset($_SESSION['google_signup_pending']);

            jsonResponse(
                true,
                'Google account login successful.',
                [
                    'action' => 'login',
                    'redirect' => '../Citizens/citizen.php'
                ]
            );
        }


        /*
         * ------------------------------------------------------------
         * Check whether the email already exists.
         * ------------------------------------------------------------
         */

        $sqlEmail = "
            SELECT
                citizenID,
                fullName,
                email,
                authProvider
            FROM tbl_citizens
            WHERE email = :email
            LIMIT 1
        ";

        $stmtEmail = $pdo->prepare($sqlEmail);

        $stmtEmail->execute([
            ':email' => $email
        ]);

        $existingEmailUser = $stmtEmail->fetch(PDO::FETCH_ASSOC);

        if ($existingEmailUser) {

            unset($_SESSION['google_signup_pending']);

            /*
             * Do NOT automatically convert an existing local account
             * into a Google account.
             */
            jsonResponse(
                false,
                'An account with this email already exists. Please use the existing login method.'
            );
        }


        /*
         * ------------------------------------------------------------
         * New Google account.
         * ------------------------------------------------------------
         *
         * Contact number is required by your database, so we ask the
         * browser for it before creating the account.
         */

        jsonResponse(
            true,
            'Google account verified. Contact number is required to complete registration.',
            [
                'action' => 'complete_registration',
                'fullName' => $fullName,
                'email' => $email,
                'profileImage' => $profileImage
            ]
        );

    } catch (PDOException $e) {

        error_log(
            'Google signup database error: ' . $e->getMessage()
        );

        jsonResponse(
            false,
            'A database error occurred. Please try again.'
        );
    }
}


/*
|--------------------------------------------------------------------------
| ACTION: COMPLETE REGISTRATION
|--------------------------------------------------------------------------
*/

if ($action === 'complete_registration') {

    /*
     * Make sure a verified Google identity exists in this session.
     */
    if (!isset($_SESSION['google_signup_pending'])) {
        jsonResponse(
            false,
            'Google signup session expired. Please start again.'
        );
    }

    $pending = $_SESSION['google_signup_pending'];

    /*
     * Check session expiration.
     */
    if (
        !isset($pending['createdAt']) ||
        (time() - (int)$pending['createdAt']) > 600
    ) {
        unset($_SESSION['google_signup_pending']);

        jsonResponse(
            false,
            'Google signup session expired. Please start again.'
        );
    }

    /*
     * Contact number supplied by the citizen.
     */
    $contactNumber = trim(
        $_POST['contact_number'] ?? ''
    );

    /*
     * Validate Philippine mobile number format.
     *
     * Your existing registration uses exactly 11 digits.
     */
    if (!preg_match('/^[0-9]{11}$/', $contactNumber)) {

        jsonResponse(
            false,
            'Please enter a valid 11-digit contact number.'
        );
    }

    /*
     * Retrieve verified Google information from SESSION,
     * not from the browser.
     */
    $googleID = $pending['googleID'];
    $email = $pending['email'];
    $fullName = $pending['fullName'];
    $profileImage = $pending['profileImage'];

    try {

        /*
         * Double-check that the email hasn't been registered
         * while the Google signup process was open.
         */
        $sqlCheck = "
            SELECT citizenID
            FROM tbl_citizens
            WHERE email = :email
            LIMIT 1
        ";

        $stmtCheck = $pdo->prepare($sqlCheck);

        $stmtCheck->execute([
            ':email' => $email
        ]);

        if ($stmtCheck->fetch()) {

            unset($_SESSION['google_signup_pending']);

            jsonResponse(
                false,
                'An account with this email already exists.'
            );
        }


        /*
         * Double-check Google ID as well.
         */
        $sqlCheckGoogle = "
            SELECT citizenID
            FROM tbl_citizens
            WHERE googleID = :googleID
            LIMIT 1
        ";

        $stmtCheckGoogle = $pdo->prepare($sqlCheckGoogle);

        $stmtCheckGoogle->execute([
            ':googleID' => $googleID
        ]);

        if ($stmtCheckGoogle->fetch()) {

            unset($_SESSION['google_signup_pending']);

            jsonResponse(
                false,
                'This Google account is already registered.'
            );
        }


        /*
         * New Google citizen account.
         *
         * Important:
         * verificationStatus remains Unverified because Google
         * authentication is NOT your Valid ID verification.
         */
        $sqlInsert = "
            INSERT INTO tbl_citizens
            (
                fullName,
                profileImage,
                email,
                authProvider,
                googleID,
                contactNumber,
                passwordHash,
                verificationStatus
            )
            VALUES
            (
                :fullName,
                :profileImage,
                :email,
                'google',
                :googleID,
                :contactNumber,
                NULL,
                'Unverified'
            )
        ";

        $stmtInsert = $pdo->prepare($sqlInsert);

        $executed = $stmtInsert->execute([
            ':fullName' => $fullName,
            ':profileImage' => $profileImage !== ''
                ? $profileImage
                : null,
            ':email' => $email,
            ':googleID' => $googleID,
            ':contactNumber' => $contactNumber
        ]);

        if (!$executed) {
            jsonResponse(
                false,
                'Unable to create your account.'
            );
        }

        /*
         * Get the newly created citizen ID.
         */
        $newCitizenID = (int)$pdo->lastInsertId();


        /*
         * Operational log.
         */
        logOperation(
            $pdo,
            'citizen',
            $newCitizenID,
            $fullName,
            'Citizen Google Registration',
            "New citizen account registered using Google with email {$email}.",
            null,
            null,
            'Registered'
        );


        /*
         * Create the normal citizen session.
         */
        session_regenerate_id(true);

        $_SESSION['login_attempts'] = 0;
        $_SESSION['lock_until'] = 0;

        $_SESSION['user_id']             = $newCitizenID;
        $_SESSION['user_email']          = $email;
        $_SESSION['user_role']           = 'citizen';
        $_SESSION['user_type']           = 'citizen';
        $_SESSION['verification_status'] = 'Unverified';
        $_SESSION['logged_in']           = true;

        /*
         * Remove temporary Google signup information.
         */
        unset($_SESSION['google_signup_pending']);


        /*
         * Successful Google registration.
         */
        jsonResponse(
            true,
            'Your account has been created successfully.',
            [
                'action' => 'registered',
                'redirect' => '../Citizens/citizen.php'
            ]
        );

    } catch (PDOException $e) {

        error_log(
            'Google signup insertion error: ' . $e->getMessage()
        );

        jsonResponse(
            false,
            'Unable to create your account. Please try again.'
        );
    }
}


/*
|--------------------------------------------------------------------------
| INVALID ACTION
|--------------------------------------------------------------------------
*/

jsonResponse(
    false,
    'Invalid Google signup action.'
);

?>

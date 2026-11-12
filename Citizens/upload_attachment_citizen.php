<?php

session_start();


// =========================================================
// ENSURE CITIZEN IS LOGGED IN
// =========================================================

if (
    !isset($_SESSION['logged_in']) ||
    $_SESSION['logged_in'] !== true ||
    !isset($_SESSION['user_type']) ||
    $_SESSION['user_type'] !== 'citizen' ||
    !isset($_SESSION['user_id'])
) {
    die("Unauthorized access.");
}

$citizenID = (int) $_SESSION['user_id'];


// =========================================================
// DATABASE + OPERATIONAL LOGGING
// =========================================================

require_once "../db.php";
require_once "../Reports/log_operation.php";


// =========================================================
// GEMINI AI CONFIGURATION
// =========================================================

// PUT YOUR ACTUAL GEMINI API KEY HERE.
// Do NOT share the key publicly.

$GEMINI_API_KEY = "YOUR_ACTUAL_GEMINI_API_KEY";

$MODEL = "gemini-3.5-flash-lite";


// =========================================================
// HANDLE VALID ID UPLOAD
// =========================================================
//
// New field:
//     valid_id
//
// Temporary backward compatibility:
//     barangay_clearance
//
// This allows the current citizen JS to continue working
// until the frontend is changed to use valid_id.
//

if (
    $_SERVER["REQUEST_METHOD"] !== "POST"
) {
    die("Invalid request.");
}


// =========================================================
// GET UPLOADED FILE
// =========================================================

$file = null;

if (isset($_FILES['valid_id'])) {

    $file = $_FILES['valid_id'];

} elseif (isset($_FILES['Valid_ID'])) {

    // Temporary compatibility with the old frontend.
    $file = $_FILES['Valid_ID'];

}

if (!$file) {
    die("Please capture a valid ID.");
}


// =========================================================
// CAMERA-ONLY VALIDATION
// =========================================================

if (
    !isset($_POST['camera_capture']) ||
    $_POST['camera_capture'] !== '1'
) {
    die("Valid ID must be captured using the camera.");
}


// =========================================================
// VALIDATE UPLOAD ERROR
// =========================================================

if ($file['error'] !== UPLOAD_ERR_OK) {
    die("Upload failed.");
}


// =========================================================
// MAXIMUM FILE SIZE
// =========================================================

if ($file['size'] > 5242880) {
    die("File too large. Maximum allowed size is 5MB.");
}


// =========================================================
// VALIDATE MIME TYPE
// =========================================================

$finfo = new finfo(FILEINFO_MIME_TYPE);

$mime = $finfo->file($file['tmp_name']);

$allowed = [
    'image/jpeg' => 'jpg',
    'image/png'  => 'png'
];

if (!array_key_exists($mime, $allowed)) {

    die(
        "Invalid file format. Only JPG and PNG images " .
        "captured by the camera are accepted."
    );
}


// =========================================================
// VALIDATE THAT FILE IS ACTUALLY AN IMAGE
// =========================================================

$imageInfo = @getimagesize($file['tmp_name']);

if ($imageInfo === false) {
    die("The captured file is not a valid image.");
}

$imageWidth = (int) ($imageInfo[0] ?? 0);
$imageHeight = (int) ($imageInfo[1] ?? 0);

if ($imageWidth < 200 || $imageHeight < 200) {

    die(
        "The captured image is too small. " .
        "Please capture the valid ID clearly."
    );
}


// =========================================================
// GET CURRENT CITIZEN
// =========================================================

try {

    $stmt = $pdo->prepare("
        SELECT
            citizenID,
            fullName,
            email,
            verificationStatus,
            attachment
        FROM tbl_citizens
        WHERE citizenID = ?
        LIMIT 1
    ");

    $stmt->execute([$citizenID]);

    $citizen = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$citizen) {
        die("Citizen account not found.");
    }

    $oldStatus = $citizen['verificationStatus'];

    $oldAttachment = trim(
        (string) ($citizen['attachment'] ?? '')
    );

    $citizenName = trim(
        (string) ($citizen['fullName'] ?? '')
    );

    if ($citizenName === '') {
        $citizenName = "Unknown Citizen";
    }

} catch (PDOException $e) {

    error_log(
        "Valid ID citizen lookup error: " .
        $e->getMessage()
    );

    die("Database error.");
}


// =========================================================
// READ IMAGE FOR GEMINI
// =========================================================

$imageData = @file_get_contents($file['tmp_name']);

if ($imageData === false) {
    die("Unable to read the captured image.");
}

$base64Image = base64_encode($imageData);


// =========================================================
// VALID ID AI VALIDATION
// =========================================================
//
// IMPORTANT:
//
// The AI does NOT determine whether the ID is legally
// authentic or officially issued.
//
// It only determines whether the image appears to
// contain a recognizable valid government-issued ID.
//
// Final verification remains with the administrator.
//

$prompt = <<<PROMPT

You are SupportCore AI, an image-document validation assistant
for the AI-Assisted Online Complaint and Operations Management
System of the City Government of Malabon.

Your task is to determine whether the uploaded image APPEARS
TO BE A VALID GOVERNMENT-ISSUED IDENTIFICATION CARD OR
IDENTIFICATION DOCUMENT.

This is NOT an authenticity verification.

You must NOT claim that an ID, document, government seal,
signature, identification number, or issuing authority is
genuinely authentic.

You are only checking whether the image visually and textually
resembles a legitimate government-issued identification document.

===============================================================
ACCEPTABLE VALID ID TYPES
===============================================================

The image may contain a recognizable government-issued ID
or identification document.

Examples include, but are not limited to:

- Philippine National ID / PhilSys ID
- Driver's License
- Passport
- UMID
- SSS ID
- GSIS ID
- PRC ID
- Postal ID
- Senior Citizen ID
- PWD ID
- Government employee ID
- Other recognizable government-issued identification

The exact design may vary.

Do NOT require one specific ID type.

===============================================================
IMPORTANT ID INDICATORS
===============================================================

Check the image for several of the following indicators:

1. IDENTIFICATION INFORMATION

Look for information such as:

- Full name
- Given name
- Middle name or middle initial
- Surname
- Date of birth
- Address
- Sex
- Nationality
- Identification number
- Personal information normally found on an ID

Not every valid ID must contain every field.

---------------------------------------------------------------

2. IDENTITY PHOTO

Look for:

- A person's identification photograph
- A portrait area
- A recognizable ID-style photo

An ID does not necessarily need a photograph if the document
type can reasonably function as government identification
without one.

---------------------------------------------------------------

3. GOVERNMENT OR ISSUING AUTHORITY

Look for indications of an issuing organization such as:

- Philippine government agency
- Government department
- Government authority
- Public agency
- Recognizable government-issued identification branding

Do NOT claim that the issuing authority is genuine.

Only determine whether the document appears to identify
a government or public issuing authority.

---------------------------------------------------------------

4. IDENTIFICATION NUMBER

Look for:

- ID number
- Document number
- License number
- Passport number
- Reference number
- Other identification number

The number does NOT need to be verified.

---------------------------------------------------------------

5. DOCUMENT STRUCTURE

The image should resemble an actual identification document.

Examples:

- Plastic identification card
- Government ID card
- Passport identification page
- Official identification document
- Structured identification layout

It should not simply be an ordinary photograph or random
piece of paper.

---------------------------------------------------------------

6. READABILITY

The ID must be sufficiently visible to inspect.

Reject images that are:

- Completely blurry
- Mostly dark
- Mostly blank
- Too far away
- Severely obstructed
- Cropped so heavily that the ID cannot be identified
- Impossible to read

===============================================================
IMPORTANT REJECTION RULES
===============================================================

Return is_valid_id = false when:

- The image is a selfie without an ID.
- The image is an ordinary photograph.
- The image is a random piece of paper.
- The image is a receipt.
- The image is a random screenshot.
- The image is a Barangay Clearance or ordinary barangay
  document without identification characteristics.
- The image is an unrelated document.
- The image contains no recognizable identification information.
- The image is too blurry or unreadable.
- The image is mostly blank.
- The image is not reasonably recognizable as an ID or
  government identification document.

DO NOT reject an ID merely because its design is unfamiliar.

DO NOT require one specific government ID.

DO NOT reject an ID simply because a particular field is absent.

DO NOT claim that an ID is legally authentic.

===============================================================
STRICT VALIDATION
===============================================================

For is_valid_id = true, the image should generally contain
multiple recognizable identification characteristics.

These may include:

- Identification information

AND

- Recognizable ID/document structure

AND

- Government or issuing authority indication

AND/OR

- Identification number

AND/OR

- ID photograph or other strong identity-document feature

AND

- Sufficient readability

Use the overall appearance of the document.

Do not require every individual indicator.

===============================================================
CITIZEN NAME
===============================================================

The citizen's registered name is:

$citizenName

If a name is visible on the ID, determine whether it appears
reasonably consistent with the registered citizen name.

Do NOT require an exact character-for-character match because
IDs may contain:

- Middle initials
- Middle names
- Abbreviations
- Formatting differences
- Name ordering differences
- Minor spelling variations

If the citizen name is not visible because of image quality,
do not automatically reject the ID solely for that reason.

If the visible name clearly belongs to a completely different
person, name_consistent should be false.

===============================================================
OUTPUT
===============================================================

Return ONLY valid JSON.

Use this exact structure:

{
    "is_valid_id": true,
    "confidence": 0.95,
    "has_identity_information": true,
    "has_id_photo": true,
    "has_issuing_authority": true,
    "has_identification_number": true,
    "has_document_structure": true,
    "is_readable": true,
    "name_consistent": true,
    "reason": "The image appears to be a recognizable government-issued identification document with identity information, an ID-style photograph, issuing authority information, identification details, and a clear document structure."
}

Confidence must be between 0.00 and 1.00.

Do not state that the ID is legally authentic.

===============================================================
REGISTERED CITIZEN
===============================================================

$citizenName

PROMPT;


// =========================================================
// GEMINI API REQUEST
// =========================================================

$url =
    "https://generativelanguage.googleapis.com/v1beta/models/" .
    $MODEL .
    ":generateContent?key=" .
    $GEMINI_API_KEY;


$payload = [

    "contents" => [

        [

            "parts" => [

                [
                    "text" => $prompt
                ],

                [
                    "inline_data" => [

                        "mime_type" => $mime,

                        "data" => $base64Image
                    ]
                ]

            ]

        ]

    ],

    "generationConfig" => [

        "temperature" => 0.1,

        "responseMimeType" => "application/json"

    ]

];


// =========================================================
// CURL REQUEST
// =========================================================

$ch = curl_init($url);

curl_setopt_array($ch, [

    CURLOPT_RETURNTRANSFER => true,

    CURLOPT_POST => true,

    CURLOPT_HTTPHEADER => [

        "Content-Type: application/json"

    ],

    CURLOPT_POSTFIELDS => json_encode(
        $payload,
        JSON_UNESCAPED_SLASHES
    ),

    CURLOPT_CONNECTTIMEOUT => 20,

    CURLOPT_TIMEOUT => 60

]);


$response = curl_exec($ch);


// =========================================================
// CHECK CURL ERROR
// =========================================================

if ($response === false) {

    $curlError = curl_error($ch);

    curl_close($ch);

    error_log(
        "Valid ID Gemini connection error: " .
        $curlError
    );

    die(
        "Unable to contact the verification AI. " .
        "Please try again."
    );
}


// =========================================================
// GET HTTP STATUS
// =========================================================

$httpCode = curl_getinfo(
    $ch,
    CURLINFO_HTTP_CODE
);

curl_close($ch);


// =========================================================
// CHECK GEMINI HTTP RESPONSE
// =========================================================

if ($httpCode < 200 || $httpCode >= 300) {

    error_log(
        "Valid ID Gemini HTTP error: " .
        $httpCode .
        " Response: " .
        $response
    );

    die(
        "The verification AI could not process the image. " .
        "Please try again."
    );
}


// =========================================================
// DECODE GEMINI RESPONSE
// =========================================================

$data = json_decode(
    $response,
    true
);

if (!is_array($data)) {

    error_log(
        "Invalid Gemini API response: " .
        $response
    );

    die(
        "The verification AI returned an invalid response. " .
        "Please try again."
    );
}


// =========================================================
// GET AI TEXT RESPONSE
// =========================================================

$rawAI =
    $data['candidates'][0]['content']['parts'][0]['text']
    ?? '';


// =========================================================
// CHECK EMPTY AI RESPONSE
// =========================================================

if ($rawAI === '') {

    error_log(
        "Valid ID Gemini returned an empty response: " .
        $response
    );

    die(
        "The verification AI returned no result. " .
        "Please try again."
    );
}


// =========================================================
// CLEAN POSSIBLE MARKDOWN CODE FENCES
// =========================================================

$rawAI = trim($rawAI);


// Remove opening ```json or ```
$rawAI = preg_replace(
    '/^```(?:json)?\s*/i',
    '',
    $rawAI
);


// Remove closing ```
$rawAI = preg_replace(
    '/\s*```$/',
    '',
    $rawAI
);

$rawAI = trim($rawAI);


// =========================================================
// DECODE AI JSON
// =========================================================

$ai = json_decode(
    $rawAI,
    true
);

if (!is_array($ai)) {

    error_log(
        "Invalid Valid ID AI JSON: " .
        $rawAI
    );

    die(
        "The verification AI returned an invalid result. " .
        "Please try again."
    );
}


// =========================================================
// READ AI RESULT
// =========================================================

$isValidID =
    filter_var(
        $ai['is_valid_id'] ?? false,
        FILTER_VALIDATE_BOOLEAN
    );


$confidence =
    (float) (
        $ai['confidence'] ??
        0
    );


$hasIdentityInformation =
    filter_var(
        $ai['has_identity_information'] ?? false,
        FILTER_VALIDATE_BOOLEAN
    );


$hasIDPhoto =
    filter_var(
        $ai['has_id_photo'] ?? false,
        FILTER_VALIDATE_BOOLEAN
    );


$hasIssuingAuthority =
    filter_var(
        $ai['has_issuing_authority'] ?? false,
        FILTER_VALIDATE_BOOLEAN
    );


$hasIdentificationNumber =
    filter_var(
        $ai['has_identification_number'] ?? false,
        FILTER_VALIDATE_BOOLEAN
    );


$hasDocumentStructure =
    filter_var(
        $ai['has_document_structure'] ?? false,
        FILTER_VALIDATE_BOOLEAN
    );


$isReadable =
    filter_var(
        $ai['is_readable'] ?? false,
        FILTER_VALIDATE_BOOLEAN
    );


$nameConsistent =
    filter_var(
        $ai['name_consistent'] ?? false,
        FILTER_VALIDATE_BOOLEAN
    );


$aiReason =
    trim(
        (string) (
            $ai['reason'] ??
            ''
        )
    );


// =========================================================
// SERVER-SIDE SAFETY CHECK
// =========================================================
//
// Do not blindly trust only the AI's final boolean.
//

$requiredIndicators =
    $hasIdentityInformation &&
    $hasDocumentStructure &&
    $isReadable;


// At least one strong identification characteristic
// should be present in addition to the basic structure.

$strongIDIndicator =
    $hasIDPhoto ||
    $hasIssuingAuthority ||
    $hasIdentificationNumber;


// Confidence threshold

$confidencePass =
    $confidence >= 0.70;


// =========================================================
// FINAL AI DOCUMENT DECISION
// =========================================================

$documentAccepted =
    $isValidID &&
    $requiredIndicators &&
    $strongIDIndicator &&
    $confidencePass;


// =========================================================
// REJECT INVALID DOCUMENT
// =========================================================
//
// Invalid images are NOT moved into /uploads.
//

if (!$documentAccepted) {

    $reason =
        $aiReason !== ''
            ? $aiReason
            : "The captured image does not contain enough indicators of a valid government-issued ID.";

    error_log(
        "Valid ID AI rejected citizen " .
        $citizenID .
        ": " .
        $reason
    );

    http_response_code(422);

    header(
        "Content-Type: application/json; charset=UTF-8"
    );

    echo json_encode([

        "success" => false,

        "error" => "invalid_valid_id",

        "message" =>
            "This image does not appear to be a valid government-issued ID. " .
            "Please capture a clear image of your valid ID showing the " .
            "identification details and document information."

    ]);

    exit;
}


// =========================================================
// GENERATE SECURE UNIQUE FILE NAME
// =========================================================

$filename =
    "valid_id_" .
    $citizenID .
    "_" .
    bin2hex(random_bytes(8)) .
    "." .
    $allowed[$mime];


// =========================================================
// UPLOAD DIRECTORY
// =========================================================

$uploadDirectory =
    dirname(__DIR__) .
    DIRECTORY_SEPARATOR .
    "uploads" .
    DIRECTORY_SEPARATOR;


// =========================================================
// CREATE UPLOAD DIRECTORY
// =========================================================

if (!is_dir($uploadDirectory)) {

    if (!mkdir($uploadDirectory, 0755, true)) {

        die(
            "Unable to create upload directory."
        );
    }
}


$upload_path =
    $uploadDirectory .
    $filename;


// =========================================================
// MOVE VERIFIED-LOOKING IMAGE
// =========================================================

if (
    !move_uploaded_file(
        $file['tmp_name'],
        $upload_path
    )
) {

    die(
        "Error moving uploaded file."
    );
}


// =========================================================
// UPDATE CITIZEN VERIFICATION
// =========================================================
//
// AI does NOT mark the citizen as Verified.
//
// Result:
//
// Pending → Admin Review → Verified / Rejected
//

try {

    $stmt = $pdo->prepare("
        UPDATE tbl_citizens
        SET
            attachment = :attachment,
            verificationStatus = 'Pending'
        WHERE citizenID = :citizenID
    ");

    $stmt->execute([

        ':attachment' => $filename,

        ':citizenID' => $citizenID

    ]);


    // =====================================================
    // DELETE PREVIOUS PHYSICAL ATTACHMENT
    // =====================================================

    if (
        $oldAttachment !== '' &&
        $oldAttachment !== $filename
    ) {

        $oldFilePath =
            $uploadDirectory .
            basename($oldAttachment);

        if (
            file_exists($oldFilePath) &&
            is_file($oldFilePath)
        ) {

            @unlink($oldFilePath);
        }
    }


    // =====================================================
    // LOG VERIFICATION SUBMISSION
    // =====================================================

    logOperation(

        $pdo,

        "citizen",

        $citizenID,

        $citizen['email'] ?? "Unknown Citizen",

        "VERIFICATION_SUBMITTED",

        "Citizen submitted a valid ID that passed the AI document-format validation and is waiting for admin verification.",

        null,

        $oldStatus,

        "Pending"

    );


    // =====================================================
    // SUCCESS
    // =====================================================

    header(
        "Location: citizen.php?upload=success"
    );

    exit();


} catch (PDOException $e) {


    // =====================================================
    // DELETE NEW FILE IF DATABASE UPDATE FAILS
    // =====================================================

    if (file_exists($upload_path)) {

        @unlink($upload_path);
    }


    error_log(
        "Valid ID database update error: " .
        $e->getMessage()
    );


    die(
        "Database update error."
    );
}

?>
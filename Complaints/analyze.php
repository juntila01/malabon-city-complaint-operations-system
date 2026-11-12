<?php
// analyze.php
error_reporting(E_ALL);
ini_set('display_errors', 0);

session_start();

header("Content-Type: application/json");
require_once "../db.php";
require_once "../Reports/log_operation.php";


function respond($arr){
    echo json_encode($arr);
    exit;
}


function saveManualReviewFallback()
{
    global $pdo, $citizenID, $text, $ip;
    global $latitude, $longitude, $accuracy;
    global $uploadDir, $newName, $webPath, $mime;

    try {
        // Reconnect in case the AI request caused the DB
        // connection to expire.
        $pdo = null;
        require __DIR__ . "/../db.php";

        $pdo->beginTransaction();

        // Lock the citizen row to prevent simultaneous
        // submissions from bypassing the emergency limit.
        $stmt = $pdo->prepare("
            SELECT verificationStatus, emergencyComplaintUsed
            FROM tbl_citizens
            WHERE citizenID = :citizenID
            LIMIT 1
            FOR UPDATE
        ");

        $stmt->execute([
            ":citizenID" => $citizenID
        ]);

        $citizen = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$citizen || $citizen['verificationStatus'] === 'Rejected') {
            throw new Exception(
                "Your account cannot submit this complaint."
            );
        }

        $isVerifiedNow =
            $citizen['verificationStatus'] === 'Verified';

        $emergencyUsed =
            (int)$citizen['emergencyComplaintUsed'];

        // Since urgency is unknown during an AI outage,
        // conservatively allow only one active complaint
        // of any type while awaiting manual review.
        $stmt = $pdo->prepare("
            SELECT COUNT(*)
            FROM tbl_complaints
            WHERE citizenID = :citizenID
              AND status NOT IN ('Resolved', 'Rejected')
        ");

        $stmt->execute([
            ":citizenID" => $citizenID
        ]);

        if ((int)$stmt->fetchColumn() > 0) {
            throw new Exception(
                "You already have an active complaint. Please wait for it to be reviewed or resolved before submitting another complaint."
            );
        }

        // Pending/unverified citizens may use their
        // one-time emergency allowance for this report.
        if (!$isVerifiedNow && $emergencyUsed === 1) {
            throw new Exception(
                "Your one-time emergency complaint has already been used."
            );
        }

        // Do not invent urgency or an SLA deadline.
        // The complaint remains Pending until a human
        // reviewer determines its category and urgency.
        $stmt = $pdo->prepare("
            INSERT INTO tbl_complaints
            (
                citizenID,
                assignedStaffID,
                rawComplaintText,
                status,
                submitIP,
                createdAt,
                deadlineAt,
                slaStatus,
                aiAnalysisStatus
            )
            VALUES
            (
                :citizenID,
                NULL,
                :complaintText,
                'Pending',
                :submitIP,
                NOW(),
                NULL,
                NULL,
                'Unavailable'
            )
        ");

        $stmt->execute([
            ":citizenID" => $citizenID,
            ":complaintText" => $text,
            ":submitIP" => $ip
        ]);

        $complaintID = (int)$pdo->lastInsertId();

        $reference =
            'MAL-COM-' .
            date('Y') .
            '-' .
            str_pad($complaintID, 6, '0', STR_PAD_LEFT);

        $stmt = $pdo->prepare("
            UPDATE tbl_complaints
            SET complaintReference = :reference
            WHERE complaintID = :complaintID
        ");

        $stmt->execute([
            ":reference" => $reference,
            ":complaintID" => $complaintID
        ]);

        // Save GPS coordinates if supplied.
        if ($latitude !== null && $longitude !== null) {
            $stmt = $pdo->prepare("
                INSERT INTO tbl_complaint_locations
                (
                    complaintID,
                    latitude,
                    longitude,
                    accuracy
                )
                VALUES
                (
                    :complaintID,
                    :latitude,
                    :longitude,
                    :accuracy
                )
            ");

            $stmt->execute([
                ":complaintID" => $complaintID,
                ":latitude" => $latitude,
                ":longitude" => $longitude,
                ":accuracy" => $accuracy
            ]);
        }

        // Preserve the uploaded evidence.
        $stmt = $pdo->prepare("
            INSERT INTO tbl_attachments
            (
                complaintID,
                fileName,
                filePath,
                fileType,
                uploadedAt
            )
            VALUES
            (
                :complaintID,
                :fileName,
                :filePath,
                :fileType,
                NOW()
            )
        ");

        $stmt->execute([
            ":complaintID" => $complaintID,
            ":fileName" => $newName,
            ":filePath" => $webPath,
            ":fileType" => $mime
        ]);

        // Consume the one-time allowance for an unverified
        // citizen because this report has unknown urgency.
        if (!$isVerifiedNow) {
            $stmt = $pdo->prepare("
                UPDATE tbl_citizens
                SET emergencyComplaintUsed = 1
                WHERE citizenID = :citizenID
                  AND emergencyComplaintUsed = 0
            ");

            $stmt->execute([
                ":citizenID" => $citizenID
            ]);

            if ($stmt->rowCount() !== 1) {
                throw new Exception(
                    "Your emergency complaint allowance is no longer available."
                );
            }
        }

        $pdo->commit();

        // Logging failure must not undo a saved complaint.
        try {
            logOperation(
                $pdo,
                "citizen",
                (int)$citizenID,
                $_SESSION['user_email'] ?? "Unknown Citizen",
                "Complaint Submitted - Manual Review",
                "Complaint saved because AI analysis was unavailable.",
                $complaintID,
                null,
                "Status: Pending | AI Analysis: Unavailable"
            );
        } catch (Throwable $logError) {
            error_log(
                "Manual-review complaint logging failed: " .
                $logError->getMessage()
            );
        }

        respond([
            "status" => "success",
            "complaintID" => $complaintID,
            "complaintReference" => $reference,
            "aiAnalysisStatus" => "Unavailable",
            "requiresManualReview" => true,
            "message" =>
                "Your complaint was submitted successfully, but automatic analysis is temporarily unavailable. It has been saved for manual review. Its category and urgency have not yet been confirmed."
        ]);

    } catch (Throwable $e) {
        if (isset($pdo) && $pdo instanceof PDO && $pdo->inTransaction()) {
            $pdo->rollBack();
        }

        // If the database save failed, remove the evidence
        // file so it does not become an orphaned upload.
        if (isset($uploadDir, $newName)) {
            @unlink($uploadDir . $newName);
        }

        error_log(
            "Manual-review fallback failed: " .
            $e->getMessage()
        );

        respond([
            "status" => "error",
            "message" =>
                "We could not save your complaint for manual review. Please try again later."
        ]);
    }
}


$text = trim($_POST['text'] ?? '');

$latitude = isset($_POST['latitude']) && $_POST['latitude'] !== ''
    ? (float) $_POST['latitude']
    : null;

$longitude = isset($_POST['longitude']) && $_POST['longitude'] !== ''
    ? (float) $_POST['longitude']
    : null;

$accuracy = isset($_POST['accuracy']) && $_POST['accuracy'] !== ''
    ? (float) $_POST['accuracy']
    : null;

if ($latitude !== null && ($latitude < -90 || $latitude > 90)) {
    respond([
        "status" => "error",
        "message" => "Invalid latitude."
    ]);
}

if ($longitude !== null && ($longitude < -180 || $longitude > 180)) {
    respond([
        "status" => "error",
        "message" => "Invalid longitude."
    ]);
}

if($text==='') {
    respond([
        "status"=>"error",
        "message"=>"Complaint description cannot be empty."
    ]);
}


/*
|--------------------------------------------------------------------------
| Anti Spam
|--------------------------------------------------------------------------
*/

$ip = $_SERVER['REMOTE_ADDR'];

if (
    !isset($_SESSION['logged_in']) ||
    $_SESSION['user_type'] !== 'citizen'
) {
    respond([
        "status" => "error",
        "message" => "You must be logged in."
    ]);
}

$citizenID = $_SESSION['user_id'];


// ============================================================
// CITIZEN VERIFICATION / EMERGENCY COMPLAINT STATUS
// ============================================================

$stmt = $pdo->prepare("
    SELECT
        verificationStatus,
        emergencyComplaintUsed,
        activeComplaintID
    FROM tbl_citizens
    WHERE citizenID = :citizenID
    LIMIT 1
");

$stmt->execute([
    ":citizenID" => $citizenID
]);

$citizen = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$citizen) {
    respond([
        "status" => "error",
        "message" => "Citizen account could not be found."
    ]);
}

$verificationStatus = $citizen['verificationStatus'];
$emergencyComplaintUsed = (int)$citizen['emergencyComplaintUsed'];

$isVerified = ($verificationStatus === 'Verified');
$isPending = ($verificationStatus === 'Pending');
$isRejected = ($verificationStatus === 'Rejected');


// Rejected accounts cannot submit any complaint.
if ($isRejected) {

    respond([
        "status" => "error",
        "message" => "Your account has been rejected and cannot submit complaints."
    ]);
}


// ============================================================
// 30 SECOND COOLDOWN
// ============================================================

$stmt = $pdo->prepare("
    SELECT createdAt
    FROM tbl_complaints
    WHERE submitIP = :ip
      AND createdAt >= DATE_SUB(NOW(), INTERVAL 30 SECOND)
    LIMIT 1
");

$stmt->execute([
    ":ip" => $ip
]);

if ($stmt->fetch()) {
    respond([
        "status" => "error",
        "message" => "Please wait a few more seconds before submitting another complaint."
    ]);
}


// ============================================================
// DUPLICATE TEXT CHECK
// ============================================================

$stmt = $pdo->prepare("
    SELECT complaintID
    FROM tbl_complaints
    WHERE rawComplaintText = :txt
    AND createdAt >= DATE_SUB(NOW(), INTERVAL 5 MINUTE)
    LIMIT 1
");

$stmt->execute([
    ":txt"=>$text
]);

if($stmt->fetch()){

    respond([
        "status"=>"error",
        "message"=>"This complaint appears to have already been submitted recently."
    ]);
}


/*
 CONFIGURATION
*/

$GEMINI_API_KEY = "YOUR_ACTUAL_GEMINI_API_KEY";
$MODEL = "gemini-3.5-flash-lite";


// ============================================================
// EVIDENCE UPLOAD
// Supports:        
// - JPG
// - JPEG
// - PNG
// - MP4
// - WebM
//
// Maximum size: 5MB
// ============================================================

if (!isset($_FILES['image'])) {

    respond([
        "status" => "error",
        "message" => "Evidence is required."
    ]);

}

$evidence = $_FILES['image'];

if ($evidence['error'] !== UPLOAD_ERR_OK) {

    respond([
        "status" => "error",
        "message" => "Evidence upload failed."
    ]);

}


// ============================================================
// FILE SIZE
// ============================================================

if ($evidence['size'] > 5 * 1024 * 1024) {

    respond([
        "status" => "error",
        "message" => "Maximum evidence size is 5MB."
    ]);

}


// ============================================================
// DETERMINE REAL MIME TYPE
// ============================================================

$finfo = finfo_open(FILEINFO_MIME_TYPE);

$mime = finfo_file(
    $finfo,
    $evidence['tmp_name']
);

finfo_close($finfo);


// ============================================================
// ALLOWED TYPES
// ============================================================

$allowedImages = [
    "image/jpeg",
    "image/png"
];

$allowedVideos = [
    "video/mp4",
    "video/webm"
];

$isImage = in_array(
    $mime,
    $allowedImages,
    true
);

$isVideo = in_array(
    $mime,
    $allowedVideos,
    true
);


if (!$isImage && !$isVideo) {

    respond([
        "status" => "error",
        "message" => "Only JPG, PNG, MP4, and WebM evidence files are allowed."
    ]);

}


// ============================================================
// CREATE UPLOAD DIRECTORY
// ============================================================

$uploadDir = "../uploads/";

if (!is_dir($uploadDir)) {

    mkdir(
        $uploadDir,
        0777,
        true
    );

}


// ============================================================
// FILE EXTENSION
// ============================================================

$extension = strtolower(
    pathinfo(
        $evidence["name"],
        PATHINFO_EXTENSION
    )
);


// ============================================================
// CREATE UNIQUE FILE NAME
// ============================================================

$newName =
    uniqid("CMP_", true)
    . "."
    . $extension;


$webPath =
    "uploads/"
    . $newName;


// ============================================================
// MOVE FILE
// ============================================================

if (!move_uploaded_file(
    $evidence["tmp_name"],
    $uploadDir . $newName
)) {

    respond([
        "status" => "error",
        "message" => "Unable to save uploaded evidence."
    ]);

}


// ============================================================
// DEFAULT ANALYSIS VALUES
// ============================================================

$category = "Obstruction";
$urgency = "NORMAL";
$location = "Unknown";
$summary = "";
$confidence = 0;
$hasLocation = false;

$imageAnalysis = "";
$imageMatch = "INCONCLUSIVE";
$imageMatchConfidence = 0;
$verificationFlag = false;
$profanity = false;

$mediaSafety = "INCONCLUSIVE";
$mediaSafetyConfidence = 0;
$mediaSafetyReason = "";


// ============================================================
// MULTIMODAL EVIDENCE ANALYSIS
// ============================================================
//
// IMAGE:
//   Complaint text + actual image -> Gemini
//
// VIDEO:
//   Complaint text + representative video frames -> Gemini
//
// IMPORTANT:
//   - Written complaint text is the primary source for category,
//     urgency, location, and summary.
//   - Visual evidence is supporting evidence.
//   - Visual evidence MUST NOT silently change the written
//     classification.
//   - Visual evidence is used for evidence matching only.
//   - MISMATCH/INCONCLUSIVE does not automatically reject.
//   - INAPPROPRIATE media is rejected.
// ============================================================

$visualParts = [];
$visualPartCount = 0;


if ($isImage) {

    $localImagePath = $uploadDir . $newName;

    $imageData = file_get_contents($localImagePath);

    if ($imageData === false) {
        @unlink($localImagePath);

        respond([
            "status" => "error",
            "message" => "Unable to read uploaded image."
        ]);
    }

    $visualParts[] = [
        "inlineData" => [
            "mimeType" => $mime,
            "data" => base64_encode($imageData)
        ]
    ];

    $visualPartCount = 1;
}


if ($isVideo) {

    // --------------------------------------------------------
    // CHECK VIDEO FRAMES
    // --------------------------------------------------------

    if (
        !isset($_FILES['videoFrames']) ||
        !is_array($_FILES['videoFrames']['tmp_name'])
    ) {
        @unlink($uploadDir . $newName);

        respond([
            "status" => "error",
            "message" => "Unable to process video evidence frames."
        ]);
    }

    $frameCount = count($_FILES['videoFrames']['tmp_name']);

    if ($frameCount < 1) {
        @unlink($uploadDir . $newName);

        respond([
            "status" => "error",
            "message" => "No video frames were received for AI analysis."
        ]);
    }

    // Maximum 10 representative frames.
    if ($frameCount > 10) {
        @unlink($uploadDir . $newName);

        respond([
            "status" => "error",
            "message" => "Too many video analysis frames were submitted."
        ]);
    }

    for ($i = 0; $i < $frameCount; $i++) {

        $tmpFrame = $_FILES['videoFrames']['tmp_name'][$i] ?? '';
        $frameError = $_FILES['videoFrames']['error'][$i] ?? UPLOAD_ERR_NO_FILE;
        $frameSize = $_FILES['videoFrames']['size'][$i] ?? 0;

        if (
            $frameError !== UPLOAD_ERR_OK ||
            !is_uploaded_file($tmpFrame)
        ) {
            continue;
        }

        // Maximum frame size: 1MB.
        if ($frameSize > 1 * 1024 * 1024) {
            continue;
        }

        $frameMime = mime_content_type($tmpFrame);

        if ($frameMime !== "image/jpeg") {
            continue;
        }

        $frameData = file_get_contents($tmpFrame);

        if ($frameData === false) {
            continue;
        }

        $visualParts[] = [
            "inlineData" => [
                "mimeType" => "image/jpeg",
                "data" => base64_encode($frameData)
            ]
        ];

        $visualPartCount++;
    }

    if ($visualPartCount < 1) {
        @unlink($uploadDir . $newName);

        respond([
            "status" => "error",
            "message" => "No valid video frames were available for AI analysis."
        ]);
    }
}


// ============================================================
// MULTIMODAL GEMINI PROMPT
// ============================================================

$evidenceType = $isImage ? "IMAGE" : "VIDEO FRAMES";


/*
|--------------------------------------------------------------------------
| IMPORTANT AI DESIGN
|--------------------------------------------------------------------------
|
| The AI must classify the complaint according to the system rules.
|
| MOST IMPORTANT URGENCY RULE:
|
| FIRE = HIGH
|
| Fire is the only category with a fixed urgency rule.
| Any genuine Fire classification MUST result in HIGH urgency.
|
| Flood, Obstruction, and Traffic use the detailed urgency rules below.
|
| The visual evidence cannot change category or urgency.
|
|--------------------------------------------------------------------------
*/

$prompt = <<<PROMPT
You are SupportCore AI for the Malabon City Complaint and Operations Management System.

You analyze citizen complaints submitted to a local government complaint
and operations management system.

Each complaint contains:

1. Written complaint text
2. One uploaded image OR representative JPEG frames from a video

Your task is to:

1. Identify exactly one complaint category.
2. Determine the urgency according to the system's urgency rules.
3. Extract the incident location from the written complaint.
4. Create a short factual summary.
5. Detect profanity in the written complaint.
6. Analyze the uploaded visual evidence.
7. Determine whether the visual evidence supports the complaint.
8. Determine whether the media is appropriate complaint evidence.

Do not invent facts.

Do not invent locations.

Do not invent injuries, deaths, trapped people, property damage,
or emergency conditions that the citizen did not report.

============================================================
CRITICAL SYSTEM RULE — FIRE
============================================================

THIS RULE HAS THE HIGHEST PRIORITY IN URGENCY CLASSIFICATION:

IF THE PRIMARY COMPLAINT CATEGORY IS FIRE, THE URGENCY MUST ALWAYS BE HIGH.

There are NO NORMAL FIRE COMPLAINTS in this system.

Any genuine complaint whose PRIMARY INCIDENT is a fire must return:

"category": "Fire"
"urgency": "HIGH"

This rule applies even if the complaint does not mention:

- injuries
- trapped people
- people inside
- spreading flames
- property damage
- deaths
- large-scale impact
- immediate danger

Do NOT downgrade a Fire complaint to NORMAL because the text is short
or lacks additional emergency details.

Examples:

"May sunog sa Longos."
-> Fire
-> HIGH

"May sunog sa bahay."
-> Fire
-> HIGH

"May maliit na sunog."
-> Fire
-> HIGH

"May nasusunog na basura."
-> Fire
-> HIGH

"May sunog sa sasakyan."
-> Fire
-> HIGH

"May apoy sa electrical post."
-> Fire
-> HIGH

"Nasusunog ang bahay namin."
-> Fire
-> HIGH

"May malaking sunog sa palengke."
-> Fire
-> HIGH

If the complaint is genuinely about a fire, ALWAYS use HIGH.

The AI must NOT reason:

"Fire but no immediate danger, therefore NORMAL."

That reasoning is NOT allowed in this system.

============================================================
LANGUAGE UNDERSTANDING
============================================================

Understand the meaning and context of:

- English
- Filipino
- Tagalog
- Taglish
- Philippine slang
- abbreviations
- informal language
- common misspellings
- phonetic spellings
- repeated letters
- omitted letters
- common Filipino typing variations

Examples:

"sonog" may mean "sunog"

"sunog" means fire

"aksidente" means accident

"naipit" may mean trapped or physically stuck depending on context

"di makalabas" may indicate inability to escape

"maraming nasugatan" means multiple injured persons

Interpret the complete complaint.

Do not depend on exact spelling.

============================================================
STAGE 1 — COMPLAINT CATEGORY
============================================================

Choose EXACTLY ONE:

Fire
Flood
Obstruction
Traffic

============================================================
FIRE
============================================================

Choose Fire when the PRIMARY incident involves:

- fire
- active fire
- flames
- burning structure
- burning house
- burning vehicle
- electrical fire
- gas-related fire
- spreading fire
- fire-related emergency
- burning materials when the complaint is reporting the fire incident

Examples:

"May sunog sa bahay namin sa Longos."
-> Fire

"Nasusunog ang sasakyan."
-> Fire

"May apoy sa poste."
-> Fire

"May sonog sa barangay."
-> Fire

IMPORTANT:

Once the primary incident is determined to be Fire,
urgency MUST be HIGH.

============================================================
FLOOD
============================================================

Choose Flood when the PRIMARY incident involves:

- flooding
- rising water
- overflowing water
- floodwater
- submerged road
- submerged house
- water preventing normal passage
- dangerous water accumulation

Example:

"May baha sa kalsada sa Potrero."
-> Flood

============================================================
OBSTRUCTION
============================================================

Choose Obstruction when the PRIMARY problem involves something blocking,
damaging, occupying, or interfering with public movement or infrastructure.

Examples:

- fallen tree
- debris
- garbage blocking a road
- blocked sidewalk
- pothole
- damaged road
- construction materials
- blocked drainage
- fallen object
- physical obstruction

Example:

"May malaking puno na bumagsak at nakaharang sa daan."
-> Obstruction

============================================================
TRAFFIC
============================================================

Choose Traffic when the PRIMARY problem involves:

- traffic congestion
- traffic jam
- vehicle collision
- road accident
- illegal parking
- traffic light problems
- vehicles interfering with traffic
- traffic-related road incident

Example:

"May aksidente sa highway kaya sobrang traffic."
-> Traffic

============================================================
PRIMARY INCIDENT RULE
============================================================

Choose the PRIMARY incident the citizen wants the government to address.

Do not choose a category merely because a related word appears.

Examples:

"May sunog sa sasakyan at maraming traffic."
-> Fire
-> HIGH

"May aksidente sa highway kaya sobrang traffic."
-> Traffic

"May baha sa kalsada kaya hindi madaanan."
-> Flood

"May puno na bumagsak at nakaharang sa daan."
-> Obstruction

============================================================
STAGE 1 — URGENCY
============================================================

Choose EXACTLY ONE:

HIGH
NORMAL

IMPORTANT:

The Fire rule above overrides all other urgency rules.

If category = Fire:
    urgency MUST = HIGH

For Flood, Obstruction, and Traffic:

Urgency must be determined from the WRITTEN COMPLAINT TEXT.

Do NOT use the image or video to increase or decrease urgency.

============================================================
CRITICAL LIFE-THREATENING INCIDENT OVERRIDE
============================================================

This rule applies to ALL complaint categories and takes priority over
the normal urgency rules.

Identify whether the written complaint describes an active, imminent,
or credible life-threatening incident.

Examples include:

1. SUICIDE ATTEMPT OR IMMEDIATE SELF-HARM DANGER
- A person is attempting suicide.
- A person has taken a potentially dangerous overdose.
- A person is actively threatening immediate self-harm and has a
  credible means or immediate opportunity to act.
- A person is in immediate danger of serious self-inflicted injury.

2. HOSTAGE-TAKING AND ABDUCTION
- A person is being held hostage.
- A person is being held against their will with a credible threat.
- An ongoing abduction or kidnapping places a person in immediate danger.

3. VIOLENCE AND THREATS TO HUMAN LIFE
- A person is being attacked with a potentially deadly weapon.
- A person has been stabbed or shot.
- A person is being threatened with imminent serious injury or death.
- An active violent incident places people in immediate danger.

4. RESCUE AND TRAPPED PERSONS
- People are trapped inside a burning building.
- A person is trapped after a vehicle collision or structural collapse.
- A person cannot escape dangerous floodwater.
- A person is trapped in another immediately dangerous situation.
- A person requires urgent rescue to prevent serious injury or death.

5. OTHER IMMEDIATE LIFE-THREATENING INCIDENTS
- A person is unconscious following an accident.
- A person is experiencing a clearly reported life-threatening emergency.
- Multiple people face an immediate threat to life.

MANDATORY URGENCY RULE:

If the written complaint clearly establishes an active or imminent
life-threatening emergency, set urgency = HIGH, regardless of whether
the primary category is Fire, Flood, Obstruction, or Traffic.

The Fire rule remains unchanged: genuine Fire complaints are always HIGH.

Do not classify a complaint as HIGH solely because it contains words
such as "suicide", "hostage", "attack", "blood", or "danger".

Interpret the full context.

For example:
- "May taong tumalon at nangangailangan ng rescue."
  -> HIGH
- "May taong hostage ngayon sa loob ng bahay."
  -> HIGH
- "May taong naipit sa sasakyan pagkatapos ng banggaan."
  -> HIGH
- "May nagbanta na sasaktan ako ngayon gamit ang baril."
  -> HIGH
- "May baha sa kalsada pero mababaw at walang agarang panganib."
  -> NORMAL
- "Napanood ko ang isang lumang balita tungkol sa hostage-taking."
  -> Do not classify as an active emergency based on this statement alone.
- "May suicidal thoughts ako pero wala akong planong saktan ang sarili ko ngayon."
  -> Do not automatically infer an active suicide attempt. Flag for
     appropriate human review and support.

Never downgrade a clearly reported active suicide attempt, hostage
incident, or other immediate threat to life to NORMAL merely because
the complaint does not mention every possible danger detail.

============================================================
EMERGENCY DEPARTMENT ROUTING GUIDANCE
============================================================

Recommend a responding department based on the PRIMARY INCIDENT
and the assistance required.

- Fire, firefighting, and fire-related rescue:
  BFP

- Rescue from fire, structural collapse, dangerous flooding, or
  another emergency requiring rescue:
  BFP may be recommended when appropriate to the incident and
  the local response protocol.

- Hostage-taking, kidnapping, armed threats, and active violent crime:
  Police response is required. If PNP is not configured in the system,
  flag the complaint for immediate dispatch supervisor review instead
  of pretending BFP is always the correct responder.

- Suicide attempt, overdose, severe injury, or medical emergency:
  Emergency medical assistance is required. Use the configured
  medical/rescue response protocol and flag for immediate review.

- Traffic congestion and ordinary traffic violations:
  PSTMO, unless the incident requires a different emergency response.

- Ordinary obstructions and non-emergency city concerns:
  Route according to the existing MCAT operational assignment rules.

HIGH urgency does not automatically mean BFP is the correct department.

Never delay escalation of a credible immediate threat to life while
waiting for an exact department classification.

The written complaint determines the incident and urgency.
Visual evidence must not be required to confirm a reported life threat.

============================================================
URGENCY FOR NON-FIRE CATEGORIES
============================================================

For Flood, Obstruction, and Traffic, HIGH means the written
complaint provides concrete information indicating an ACTIVE,
IMMEDIATE, or IMMINENT threat or a significant disruption requiring
immediate government intervention.

HIGH may apply to:

1. An immediate threat to human life.
2. Serious physical injury or a dangerous accident.
3. People trapped or unable to escape.
4. An active dangerous incident requiring immediate response.
5. A significant immediate public-safety threat affecting many people.
6. Severe, ongoing traffic congestion that substantially disrupts
   public movement, affects a large number of people, blocks emergency
   access, or requires immediate traffic-management intervention.

For Traffic, serious public disruption does not require proof of
injury or loss of life.

Evaluate the actual impact described in the written complaint.
Do not assume severe disruption when the complaint only describes
ordinary traffic.

Do not invent missing circumstances.

============================================================
HIGH — LIFE IN DANGER
============================================================

For non-Fire categories, use HIGH when the complaint clearly indicates:

- a person is in immediate danger
- a person is trapped
- a person is unable to escape
- a person is unconscious
- a person is critically injured
- people are trapped
- a person is at immediate risk of serious injury or death

Examples:

"May residenteng hindi makalabas dahil sa baha."
-> HIGH

"May taong naipit sa sasakyan."
-> HIGH

============================================================
HIGH — SERIOUS INJURY OR DANGEROUS ACCIDENT
============================================================

For Traffic, use HIGH when the complaint clearly describes:

- serious vehicle collision
- person hit by vehicle
- multiple injured people
- serious injuries
- trapped accident victims
- dangerous accident requiring immediate assistance

Examples:

"May aksidente at may mga sugatan."
-> HIGH

"May taong natamaan ng sasakyan at hindi makatayo."
-> HIGH

"May mga taong naipit pagkatapos ng banggaan."
-> HIGH

IMPORTANT:

The word "aksidente" alone does NOT automatically mean HIGH.

Example:

"May maliit na aksidente pero walang nasaktan."
-> NORMAL

============================================================
HIGH — SEVERE FLOODING
============================================================

For Flood, use HIGH when the complaint clearly describes an immediate
threat.

Examples:

"Hanggang dibdib ang baha at may mga taong hindi makalabas."
-> HIGH

"Mabilis na tumataas ang baha at may mga residenteng na-trap."
-> HIGH

"May mga taong na-stranded sa bubong dahil sa baha."
-> HIGH

The word "baha" alone does NOT automatically mean HIGH.

Example:

"May mababaw na baha sa kalsada."
-> NORMAL

**HIGH — SEVERE TRAFFIC DISRUPTION (PSTMO)**

Classify a Traffic complaint as `HIGH` when the citizen's written complaint describes a serious traffic disruption that significantly affects public movement, road access, or public safety.

Examples of HIGH traffic complaints include:

- Severe traffic congestion that causes many people or commuters to be delayed or stranded.
- A road completely blocked or impassable, preventing vehicles or commuters from passing.
- A major road obstruction causing extensive traffic buildup and preventing normal traffic flow.
- A serious road incident that creates an immediate danger to motorists, pedestrians, or commuters.
- Traffic congestion that blocks emergency vehicles or prevents emergency responders from reaching an incident.
- A major traffic disruption affecting multiple roads, intersections, or a significant number of commuters.
- A traffic situation where people cannot safely pass through the affected area.

Understand English, Filipino, Tagalog, Taglish, informal wording, and misspellings. Examples include:

- "Matinding traffic dito, maraming naabala."
- "Sobrang trapik, hindi na makadaan ang mga sasakyan."
- "Maraming commuters ang stranded dahil sa traffic."
- "Sarado ang buong kalsada at hindi makadaan ang mga sasakyan."
- "Traffic na hanggang kabilang intersection, hindi na gumagalaw."
- "Hindi makadaan ang ambulansya dahil sa sobrang traffic."

These examples should be classified as `HIGH` when the described situation meets the severe-disruption criteria.

**NORMAL — ROUTINE TRAFFIC CONCERNS (PSTMO)**

Classify a Traffic complaint as `NORMAL` when it describes ordinary traffic congestion or a routine traffic concern without a severe disruption, substantial public impact, or immediate safety danger.

Examples include:

- Ordinary rush-hour traffic.
- Moderate traffic congestion where vehicles can still move.
- A short delay at an intersection.
- General complaints that an area is traffic-prone.
- Minor illegal parking or a minor obstruction that does not significantly disrupt traffic.
- Statements that merely mention "traffic" without describing a severe situation.

**IMPORTANT CLASSIFICATION RULES**

1. Do not classify a complaint as `HIGH` merely because the citizen uses words such as "grabe," "urgent," "emergency," or "sobrang traffic." Evaluate the actual situation described.
2. A statement that many people are affected should support `HIGH` when the complaint also describes a substantial traffic disruption, such as severe congestion, blocked roads, stranded commuters, or inability to pass.
3. Do not require injuries, fire, or flooding for a traffic complaint to qualify as `HIGH`.
4. Do not assume that every traffic complaint affects many people or blocks a road unless the written complaint supports that conclusion.
5. Use the citizen's written complaint as the primary basis for urgency. Do not infer `HIGH` from an image or video alone.
6. If the description is vague and does not establish a severe disruption, classify it as `NORMAL` or follow the existing manual-review rules when the information is insufficient.
7. The responsible department for Traffic complaints is PSTMO. Department assignment must not independently determine urgency.

============================================================
NORMAL URGENCY
============================================================

For Flood, Obstruction, and Traffic, use NORMAL when the complaint
requires government action but does not establish an immediate or
imminent serious safety threat.

Examples:

"May lubak sa kalsada."
-> NORMAL

"May basura sa kalsada."
-> NORMAL

"May traffic dahil sa road construction."
-> NORMAL

"May sirang streetlight."
-> NORMAL

"May traffic light na sira."
-> NORMAL

"May maliit na baha sa kalsada."
-> NORMAL

"May puno na nakaharang sa sidewalk pero walang nasaktan."
-> NORMAL

"May debris sa kalsada pero walang nasaktan."
-> NORMAL

IMPORTANT:

These NORMAL examples do NOT apply to Fire.

Any genuine Fire complaint is HIGH.

============================================================
CRITICAL ANTI-FALSE-HIGH RULE FOR NON-FIRE
============================================================

For Flood, Obstruction, and Traffic, do NOT classify HIGH solely because
the citizen uses:

- "urgent"
- "emergency"
- "help"
- "please help"
- "danger"
- "delikado"
- "sobrang delikado"
- "malala"
- capital letters
- repeated exclamation marks
- emotional language
- angry language
- fear
- panic
- exaggerated language

Look for actual incident conditions.

IMPORTANT:

This rule does NOT override the Fire rule.

If the primary category is Fire:
HIGH is mandatory.

============================================================
NO KEYWORD-ONLY URGENCY FOR NON-FIRE
============================================================

For Flood, Obstruction, and Traffic, do not use:

"baha" = HIGH

"aksidente" = HIGH

"delikado" = HIGH

"maraming tao" = HIGH

"urgent" = HIGH

These are NOT sufficient by themselves for non-Fire categories.

For Fire, however:

"sunog" describing a genuine fire incident = Fire + HIGH

============================================================
DO NOT INFER MISSING FACTS
============================================================

Do not invent facts.

For Fire:

"May sunog sa Longos."

The correct result is:

category = Fire
urgency = HIGH

You do NOT need to invent:

- injuries
- trapped people
- spreading flames
- occupied buildings
- deaths

The Fire category itself is sufficient for HIGH in this system.

For non-Fire complaints, missing danger information should normally
result in NORMAL.

============================================================
CONFIDENCE
============================================================

The "confidence" field represents confidence in the classification
and interpretation of the complaint.

Confidence should reflect how clearly the complaint supports:

- category
- urgency
- location

IMPORTANT:

A Fire complaint can have HIGH urgency even if confidence is lower.

Do NOT downgrade a Fire complaint from HIGH to NORMAL because confidence
is below any threshold.

The system rule is:

Fire = HIGH

============================================================
LOCATION
============================================================

The location MUST come from the COMPLAINT TEXT.

DO NOT use:

- GPS coordinates
- browser location
- citizen coordinates
- image metadata
- visual evidence
- assumptions
- inferred locations

Valid examples:

"May sunog sa Barangay Longos."

-> Barangay Longos

"May baha sa Potrero."

-> Potrero

"May aksidente sa McArthur Highway."

-> McArthur Highway

"May basura na nakaharang sa Samson Road."

-> Samson Road

"May aksidente sa kanto ng Letre at McArthur Highway."

-> Letre and McArthur Highway

Invalid by themselves:

- dito
- doon
- here
- there
- sa amin
- dito sa amin
- nearby
- malapit dito
- malapit sa amin
- sa bahay namin

If no recognizable incident location is present:

"location": "Unknown"

"has_location": false

If a recognizable location is present:

"has_location": true

DO NOT invent a location.


============================================================
MALABON CITY JURISDICTION CHECK
============================================================

Determine whether the INCIDENT LOCATION in the written complaint
is within Malabon City, Metro Manila, Philippines.

Return location_scope as exactly one of:

MALABON
- The incident location is identifiable as being within Malabon City.

OUTSIDE
- The complaint identifies an incident location outside Malabon City.

UNCLEAR
- The location is missing, vague, ambiguous, or cannot confidently
  be identified as being within Malabon City.

Rules:
- Use only the written complaint to identify the incident location.
- Do not use the citizen's GPS coordinates to determine the incident location.
- Do not assume the incident is in Malabon just because the citizen lives there.
- If the location is ambiguous, return UNCLEAR.
- Never invent a location or claim that an unverified location is in Malabon.


============================================================
SUMMARY
============================================================

Create ONE short professional sentence summarizing the written complaint.

The summary must describe what the citizen reported.

Do not add:

- injuries not reported
- deaths not reported
- people not mentioned
- damage not mentioned
- locations not mentioned
- emergency conditions not mentioned

For example:

Complaint:
"May sunog sa bahay namin sa Longos."

Summary:
"A fire is reported at a house in Longos."

Do not add:
"People are trapped inside."

unless the citizen actually reported that.

============================================================
STAGE 2 — VISUAL EVIDENCE
============================================================

The visual evidence is SUPPORTING evidence only.

The visual evidence MUST NOT change:

- category
- urgency
- location
- summary

The written complaint remains the primary source for these values.

For IMAGE:

Analyze the uploaded image.

For VIDEO:

Analyze all representative video frames together as one piece of evidence.

Do not treat each frame as a separate complaint.

Do not claim that something is absent from the entire video simply because
it is not visible in one frame.

============================================================
VISUAL ANALYSIS
============================================================

Determine:

1. What is actually visible?
2. Is the visual content relevant?
3. Does it support the written complaint?
4. Does it clearly contradict the written complaint?

Do not invent visual information.

Do not assume that an unclear object is a person, fire, injury,
flood, vehicle, or other incident.

============================================================
IMAGE MATCH
============================================================

Choose EXACTLY ONE:

MATCH
PARTIAL_MATCH
MISMATCH
INCONCLUSIVE

MATCH:

The visual evidence clearly supports the main incident described
in the written complaint.

PARTIAL_MATCH:

The visual evidence appears related to the complaint, but some
important details cannot be confirmed.

MISMATCH:

The visual evidence clearly contradicts the main incident described
in the complaint.

INCONCLUSIVE:

The evidence is too unclear, insufficient, distant, obstructed,
ambiguous, or incomplete to make a reliable comparison.

IMPORTANT:

Do NOT change category because of the visual evidence.

Do NOT change urgency because of the visual evidence.

Example:

Written complaint:

"May sunog sa bahay sa Barangay Longos."

Image shows a building but flames cannot be clearly confirmed.

Keep:

category = Fire
urgency = HIGH

Then determine image_match independently.

============================================================
VISUAL DESCRIPTION
============================================================

Write a short factual description of what is actually visible.

Do not invent details.

For video frames, describe the overall visible evidence across
the supplied frames.

============================================================
PROFANITY DETECTION
============================================================

Determine whether the COMPLAINT TEXT contains profanity, vulgar language,
obscene expressions, sexual profanity, or abusive language.

Recognize:

- English
- Filipino
- Tagalog
- Taglish
- Philippine slang
- abbreviations
- altered spellings
- phonetic spellings
- omitted spaces
- number substitutions
- common evasion forms

Examples include:

tangina
tanginamo
tang ina
tang ina mo
putangina
putang ina
putanginamo
puta
pota
gago
gaga
walanghiya
walang hiya
leche
lintik
kingina

Possible evasion forms:

tngina
tngina mo
tang1na
t@ngina
put4ngina

If profanity is clearly present:

contains_profanity = true

Do not classify normal words as profanity without contextual evidence.

============================================================
MEDIA SAFETY
============================================================

Legitimate complaint evidence may include:

- blood
- injuries
- wounded people
- accidents
- damaged vehicles
- fire
- flood
- disaster scenes
- emergency situations
- deceased persons directly relevant to the reported incident

These MUST NOT automatically be classified as inappropriate.

Choose EXACTLY ONE:

SAFE
INCIDENT_GRAPHIC
INAPPROPRIATE
INCONCLUSIVE

SAFE:

Ordinary legitimate complaint evidence.

INCIDENT_GRAPHIC:

Legitimate evidence containing disturbing or graphic incident material.

INAPPROPRIATE:

Clearly contains:

- pornography
- explicit sexual activity
- explicit sexual imagery
- sexual material unrelated to the complaint
- clearly obscene material unrelated to the incident
- intentionally inappropriate sexual content

INCONCLUSIVE:

The media is too unclear to classify confidently.

Do not classify legitimate accident, fire, flood, injury, or disaster
evidence as INAPPROPRIATE simply because it is disturbing.

============================================================
VERIFICATION FLAG
============================================================

Set verification_flag to true ONLY when:

image_match = MATCH

OR

image_match = PARTIAL_MATCH

Set verification_flag to false when:

image_match = MISMATCH

OR

image_match = INCONCLUSIVE

This is only an AI evidence assessment.

It does NOT mean the complaint has been officially verified by an
administrator.

============================================================
FINAL URGENCY CHECK BEFORE OUTPUT
============================================================

Before producing the JSON:

1. Determine the PRIMARY category from the written complaint.
2. If category = Fire, FORCE urgency = HIGH.
3. Otherwise, evaluate the reported conditions and consequences
   using all applicable HIGH urgency rules, including severe traffic
   disruption.
4. Use NORMAL for ordinary congestion and routine problems that do
   not establish a significant immediate impact.
5. Do not allow visual evidence to change category or urgency.
6. Do not allow confidence to downgrade a Fire complaint.

FINAL MANDATORY FIRE RULE:

IF category == "Fire"
THEN urgency == "HIGH"

For Traffic, do not require injuries or a direct threat to life
when the written complaint clearly describes severe public
disruption requiring immediate intervention.

============================================================
OUTPUT
============================================================

Return ONLY valid JSON.

Use EXACTLY this structure:

{
    "category": "Fire",
    "urgency": "HIGH",
    "location": "Barangay Longos",
    "has_location": true,
    "location_scope": "MALABON",
    "contains_profanity": false,
    "summary": "A fire is reported in Barangay Longos.",
    "confidence": 0.98,
    "image_analysis": "The submitted visual evidence shows a building with visible flames and smoke.",
    "image_match": "MATCH",
    "image_match_confidence": 0.95,
    "verification_flag": true,
    "media_safety": "SAFE",
    "media_safety_confidence": 0.98,
    "media_safety_reason": "The visual evidence is legitimate complaint evidence and contains no clearly inappropriate content."
}

Allowed category values:

Fire
Flood
Obstruction
Traffic

Allowed urgency values:

HIGH
NORMAL

Allowed image_match values:

MATCH
PARTIAL_MATCH
MISMATCH
INCONCLUSIVE

Allowed media_safety values:

SAFE
INCIDENT_GRAPHIC
INAPPROPRIATE
INCONCLUSIVE

Return ONLY the JSON object.

============================================================
COMPLAINT TEXT
============================================================

$text

============================================================
EVIDENCE TYPE
============================================================

$evidenceType

PROMPT;


// ============================================================
// BUILD GEMINI REQUEST
// ============================================================

$requestParts = [
    [
        "text" => $prompt
    ]
];

foreach ($visualParts as $part) {
    $requestParts[] = $part;
}

$payload = [
    "contents" => [[
        "parts" => $requestParts
    ]],
    "generationConfig" => [
        "responseMimeType" => "application/json"
    ]
];


$url =
    "https://generativelanguage.googleapis.com/v1beta/models/"
    . $MODEL
    . ":generateContent";


// ============================================================
// GEMINI REQUEST WITH TEMPORARY ERROR RETRIES
// ============================================================

$maxRetries = 2;

$response = false;
$httpCode = 0;
$curlError = "";

for ($attempt = 1; $attempt <= $maxRetries; $attempt++) {

    $ch = curl_init($url);

    $jsonPayload = json_encode($payload);

    if ($jsonPayload === false) {
        @unlink($uploadDir . $newName);

        respond([
            "status" => "error",
            "message" => "Failed to encode Gemini request.",
            "json_error" => json_last_error_msg()
        ]);
    }


    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_HTTPHEADER => [
            "Content-Type: application/json",
            "x-goog-api-key: " . $GEMINI_API_KEY
        ],
        CURLOPT_POSTFIELDS => $jsonPayload,
        CURLOPT_TIMEOUT => 30,
        CURLOPT_CONNECTTIMEOUT => 10
    ]);


    $response = curl_exec($ch);

    $curlError = curl_error($ch);

    $httpCode = curl_getinfo(
        $ch,
        CURLINFO_HTTP_CODE
    );

    curl_close($ch);

    if ($response === false) {

        if ($attempt < $maxRetries) {
            sleep(2 * $attempt);
            continue;
        }

        error_log(
            "Gemini connection failed: " . $curlError
        );

        saveManualReviewFallback();

        // Safety exit in case the fallback unexpectedly returns.
        exit;
    }



    // Successful response
    if ($httpCode >= 200 && $httpCode < 300) {
        break;
    }


    // Temporary Google capacity/rate-limit issue.
    // Retry before giving up.
    if (
        ($httpCode === 429 || $httpCode === 503) &&
        $attempt < $maxRetries
    ) {

        sleep(2 * $attempt);
        continue;
    }


    // Non-retryable error.
    break;
}



/* ============================================================
   HANDLE GEMINI HTTP RESPONSE
============================================================ */

// Non-2xx HTTP responses include rate limits, server errors,
// invalid API keys, and other API failures.
if ($httpCode < 200 || $httpCode >= 300) {
    error_log("Gemini API returned HTTP " . $httpCode);
    saveManualReviewFallback();
}

// Decode the response BEFORE checking whether it is an array.
$data = json_decode((string)$response, true);

if (!is_array($data)) {
    error_log("Gemini returned invalid response JSON.");
    saveManualReviewFallback();
}

if (isset($data["error"])) {
    error_log("Gemini response contained an API error.");
    saveManualReviewFallback();
}

$raw =
    $data["candidates"][0]["content"]["parts"][0]["text"]
    ?? '';

if (!is_string($raw) || trim($raw) === '') {
    error_log("Gemini returned no analysis text.");
    saveManualReviewFallback();
}

$ai = json_decode($raw, true);

if (!is_array($ai)) {
    error_log("Gemini returned invalid analysis JSON.");
    saveManualReviewFallback();
}

// Do not save a fabricated classification if Gemini returns
// valid JSON but omits or provides invalid core classification fields.
if (
    !isset($ai['category'], $ai['urgency']) ||
    !is_string($ai['category']) ||
    !is_string($ai['urgency']) ||
    !in_array(
        trim($ai['category']),
        ['Fire', 'Flood', 'Obstruction', 'Traffic'],
        true
    ) ||
    !in_array(
        trim($ai['urgency']),
        ['HIGH', 'NORMAL'],
        true
    )
) {
    error_log(
        "Gemini returned missing or invalid category/urgency."
    );

    saveManualReviewFallback();
}


// ============================================================
// READ AI VALUES
// ============================================================

$category =
    trim($ai["category"] ?? "Obstruction");

$urgency =
    trim($ai["urgency"] ?? "NORMAL");

$location =
    trim($ai["location"] ?? "Unknown");

$hasLocation =
    isset($ai["has_location"])
    ? (bool)$ai["has_location"]
    : (
        $location !== '' &&
        strtolower($location) !== 'unknown'
    );

// ============================================================
// READ MALABON CITY JURISDICTION RESULT
// ============================================================

$locationScope = strtoupper(
    trim($ai["location_scope"] ?? "UNCLEAR")
);

if (!in_array(
    $locationScope,
    ["MALABON", "OUTSIDE", "UNCLEAR"],
    true
)) {
    $locationScope = "UNCLEAR";
}

$summary =
    trim($ai["summary"] ?? "");

$confidence =
    (float)($ai["confidence"] ?? 0);

$profanity =
    !empty(
        $ai["contains_profanity"]
    );

$imageAnalysis =
    trim($ai["image_analysis"] ?? "");

$imageMatch =
    trim(
        $ai["image_match"] ?? "INCONCLUSIVE"
    );

$imageMatchConfidence =
    (float)(
        $ai["image_match_confidence"] ?? 0
    );

$verificationFlag =
    !empty(
        $ai["verification_flag"]
    );

$mediaSafety =
    trim(
        $ai["media_safety"] ?? "INCONCLUSIVE"
    );

$mediaSafetyConfidence =
    (float)(
        $ai["media_safety_confidence"] ?? 0
    );

$mediaSafetyReason =
    trim(
        $ai["media_safety_reason"] ?? ""
    );


// ============================================================
// NORMALIZE NUMERIC CONFIDENCE VALUES
// ============================================================

$confidence =
    max(
        0,
        min(1, $confidence)
    );

$imageMatchConfidence =
    max(
        0,
        min(1, $imageMatchConfidence)
    );

$mediaSafetyConfidence =
    max(
        0,
        min(1, $mediaSafetyConfidence)
    );


// ============================================================
// VALIDATE AI OUTPUT
// ============================================================

$validCategories = [
    "Fire",
    "Flood",
    "Obstruction",
    "Traffic"
];

$validImageMatches = [
    "MATCH",
    "PARTIAL_MATCH",
    "MISMATCH",
    "INCONCLUSIVE"
];

$validMediaSafety = [
    "SAFE",
    "INCIDENT_GRAPHIC",
    "INAPPROPRIATE",
    "INCONCLUSIVE"
];


if (!in_array(
    $category,
    $validCategories,
    true
)) {

    $category = "Obstruction";
}


if (!in_array(
    $urgency,
    [
        "HIGH",
        "NORMAL"
    ],
    true
)) {

    $urgency = "NORMAL";
}


if (!in_array(
    $imageMatch,
    $validImageMatches,
    true
)) {

    $imageMatch = "INCONCLUSIVE";
}


if (!in_array(
    $mediaSafety,
    $validMediaSafety,
    true
)) {

    $mediaSafety = "INCONCLUSIVE";
}

/* ============================================================
   LIFE-THREATENING URGENCY ENFORCEMENT
============================================================ */

$complaintForSafetyCheck = mb_strtolower(
    $text,
    'UTF-8'
);

/*
 * Keep the existing mandatory Fire rule.
 */
if ($category === "Fire") {
    $urgency = "HIGH";
}

/*
 * Detect explicit emergency descriptions as a fallback.
 * Gemini still performs the main contextual analysis.
 */
$lifeThreatPatterns = [
    // Explicit hostage-taking / abduction
    '/\b(hostage|hostages|kidnapping|kidnapped|abducted)\b/u',
    '/\b(held hostage|taken hostage|held against (?:their|his|her) will)\b/u',
    '/\b(na-hostage|hinostage|kinidnap|dinukot)\b/u',

    // Explicit suicide attempts or active self-harm
    '/\b(suicide attempt|attempted suicide|trying to kill myself)\b/u',
    '/\b(actively attempting suicide|overdose attempt)\b/u',
    '/\b(tentative|tangkang magpakamatay)\b/u',
    '/\b(nagtangkang magpakamatay|nagpapakamatay ngayon)\b/u',

    // Serious violence and weapon attacks
    '/\b(shot|shooting|stabbed|stabbing)\b/u',
    '/\b(binabaril|binaril|sinaksak|sinasaksak)\b/u',

    // Trapped people and inability to escape
    '/\b(trapped inside|people are trapped|unable to escape)\b/u',
    '/\b(na-trap|naipit|hindi makalabas|di makalabas)\b/u',

    // Explicit life-threatening medical emergencies
    '/\b(unconscious after (?:an )?accident)\b/u',
    '/\b(unconscious and not responding|not breathing)\b/u'
];

$lifeThreatDetected = false;

foreach ($lifeThreatPatterns as $pattern) {
    if (preg_match($pattern, $complaintForSafetyCheck)) {
        $lifeThreatDetected = true;
        break;
    }
}

/*
 * The PHP safeguard can raise urgency but must never lower it.
 */
if ($lifeThreatDetected) {
    $urgency = "HIGH";
}


// ============================================================
// KEEP VERIFICATION FLAG CONSISTENT
// ============================================================

if (
    $imageMatch === "MISMATCH" ||
    $imageMatch === "INCONCLUSIVE"
) {

    $verificationFlag = false;

} elseif (
    $imageMatch === "MATCH" ||
    $imageMatch === "PARTIAL_MATCH"
) {

    $verificationFlag = true;
}



/* ============================================================
   MALABON CITY JURISDICTION CHECK
============================================================ */

// Reject incidents identified as outside Malabon City.
if ($locationScope === "OUTSIDE") {

    @unlink($uploadDir . $newName);

    respond([
        "status" => "error",
        "error_code" => "LOCATION_OUTSIDE_MALABON",
        "message" =>
            "Your complaint cannot be submitted because the reported incident is outside Malabon City. This system only accepts complaints about incidents within Malabon City."
    ]);
}

// Require a recognizable location confirmed as Malabon.
if (
    !$hasLocation ||
    $location === "" ||
    strtolower($location) === "unknown" ||
    $locationScope !== "MALABON"
) {

    @unlink($uploadDir . $newName);

    respond([
        "status" => "error",
        "error_code" => "MALABON_LOCATION_UNCONFIRMED",
        "message" =>
            "We could not confirm that the incident occurred within Malabon City. Please specify the incident's barangay, street, or another recognizable location within Malabon City."
    ]);
}



// ============================================================
// PROFANITY CHECK
// ============================================================

if ($profanity) {

    @unlink($uploadDir . $newName);

    respond([
        "status" => "error",
        "error_code" => "PROFANITY_DETECTED",
        "message" => "Your complaint contains offensive or inappropriate language."
    ]);
}


// ============================================================
// INAPPROPRIATE MEDIA CHECK
// ============================================================

if ($mediaSafety === "INAPPROPRIATE") {

    @unlink($uploadDir . $newName);

    respond([
        "status" => "error",
        "error_code" => $isVideo
            ? "INAPPROPRIATE_VIDEO"
            : "INAPPROPRIATE_IMAGE",
        "media_safety" => $mediaSafety,
        "media_safety_confidence" => $mediaSafetyConfidence,
        "media_safety_reason" => $mediaSafetyReason,
        "message" => $isVideo
            ? "The uploaded video contains inappropriate content and cannot be submitted."
            : "The uploaded image contains inappropriate content and cannot be submitted."
    ]);
}


// ============================================================
// FALLBACK VISUAL ANALYSIS TEXT
// ============================================================

if ($imageAnalysis === '') {

    $imageAnalysis = $isVideo
        ? "Video evidence was analyzed using representative frames."
        : "Image evidence was analyzed.";
}


// ============================================================
// EMERGENCY COMPLAINT PERMISSION
//
// Verified citizens:
//     Can submit NORMAL and HIGH complaints.
//     Emergency slot is NOT consumed.
//
// Pending citizens:
//     Can only submit HIGH complaints.
//     Their first HIGH complaint consumes the
//     one-time emergency complaint privilege.
//
// Rejected citizens:
//     Already blocked above.
// ============================================================

if (!$isVerified) {

    // Pending/unverified citizen trying to submit NORMAL
    if ($urgency !== 'HIGH') {

        @unlink($uploadDir . $newName);

        respond([
            "status" => "error",
            "message" => "Your account is not yet verified. Only emergency complaints may be submitted while your verification is pending."
        ]);
    }


    // Pending/unverified citizen already used emergency complaint
    if ($emergencyComplaintUsed === 1) {

        @unlink($uploadDir . $newName);

        respond([
            "status" => "error",
            "message" => "Your one-time emergency complaint has already been used."
        ]);
    }
}


// ============================================================
// REFRESH DATABASE CONNECTION
// ============================================================
//
// Gemini analysis can take several seconds.
// On shared hosting, the original MySQL connection may
// expire while waiting for the Gemini API response.
//
// Reconnect before starting the database transaction.
// ============================================================

$pdo = null;

require "../db.php";


try {

    $pdo->beginTransaction();


    // ============================================================
    // RE-CHECK ACTIVE COMPLAINT LIMIT INSIDE TRANSACTION
    // ============================================================
    //
    // Each citizen may have:
    //   - 1 active NORMAL complaint
    //   - 1 active HIGH / emergency complaint
    //
    // A NORMAL complaint does NOT block a HIGH complaint.
    // A HIGH complaint does NOT block a NORMAL complaint.
    //
    // The citizen row is locked first so two simultaneous
    // submissions cannot bypass the limit.
    // ============================================================

    $lockCitizenStmt = $pdo->prepare("
        SELECT citizenID
        FROM tbl_citizens
        WHERE citizenID = :citizenID
        LIMIT 1
        FOR UPDATE
    ");

    $lockCitizenStmt->execute([
        ":citizenID" => $citizenID
    ]);

    $lockedCitizen =
        $lockCitizenStmt->fetch(PDO::FETCH_ASSOC);


    if (!$lockedCitizen) {

        throw new Exception(
            "Citizen account could not be found."
        );
    }


    // ============================================================
    // COUNT ACTIVE HIGH / NORMAL COMPLAINTS
    // ============================================================

        $activeComplaintStmt = $pdo->prepare("
            SELECT
                COALESCE(
                    SUM(
                        CASE
                            WHEN c.aiAnalysisStatus = 'Unavailable'
                            THEN 1
                            ELSE 0
                        END
                    ),
                    0
                ) AS manualReviewCount,

                COALESCE(
                    SUM(
                        CASE
                            WHEN ai.urgency = 'HIGH'
                            THEN 1
                            ELSE 0
                        END
                    ),
                    0
                ) AS highCount,

                COALESCE(
                    SUM(
                        CASE
                            WHEN ai.urgency = 'NORMAL'
                            THEN 1
                            ELSE 0
                        END
                    ),
                    0
                ) AS normalCount

            FROM tbl_complaints c

            LEFT JOIN tbl_ai_analysis ai
                ON ai.complaintID = c.complaintID

            WHERE c.citizenID = :citizenID
            AND c.status NOT IN ('Resolved', 'Rejected')
        ");



    $activeComplaintStmt->execute([
        ":citizenID" => $citizenID
    ]);


    $activeCounts =
        $activeComplaintStmt->fetch(
            PDO::FETCH_ASSOC
        );


    $highCount =
        (int)(
            $activeCounts['highCount'] ?? 0
        );

    $normalCount =
        (int)(
            $activeCounts['normalCount'] ?? 0
        );

    
        $manualReviewCount =
            (int)(
                $activeCounts['manualReviewCount'] ?? 0
            );

        // Unknown urgency must not be bypassed by submitting
        // another complaint before an administrator reviews it.
        if ($manualReviewCount > 0) {
            throw new Exception(
                "You already have a complaint awaiting manual review. Please wait until it has been reviewed before submitting another complaint."
            );
        }



    // ============================================================
    // HIGH / EMERGENCY LIMIT
    // ============================================================

    if (
        $urgency === 'HIGH' &&
        $highCount >= 1
    ) {

        throw new Exception(
            "You already have an active emergency complaint. Please wait until it has been resolved before submitting another emergency complaint."
        );
    }


    // ============================================================
    // NORMAL COMPLAINT LIMIT
    // ============================================================

    if (
        $urgency === 'NORMAL' &&
        $normalCount >= 1
    ) {

        throw new Exception(
            "You already have an active normal complaint. Please wait until it has been resolved before submitting another normal complaint."
        );
    }


    // ============================================================
    // SLA DEADLINE
    // ============================================================

    $hours =
        ($urgency === "HIGH")
        ? 24
        : 72;


    $deadline =
        date(
            "Y-m-d H:i:s",
            strtotime("+{$hours} hours")
        );


    // ============================================================
    // INSERT COMPLAINT
    // ============================================================

    $stmt = $pdo->prepare("
        INSERT INTO tbl_complaints
        (
            citizenID,
            assignedStaffID,
            rawComplaintText,
            status,
            submitIP,
            createdAt,
            deadlineAt,
            slaStatus
        )
        VALUES
        (
            :citizenID,
            NULL,
            :txt,
            'Pending',
            :ip,
            NOW(),
            :deadline,
            'On Time'
        )
    ");


    $stmt->execute([
        ":citizenID" => $citizenID,
        ":txt" => $text,
        ":ip" => $ip,
        ":deadline" => $deadline
    ]);


    // Get complaint ID ONCE
    $id = (int)$pdo->lastInsertId();


    // ============================================================
    // GENERATE PUBLIC COMPLAINT REFERENCE
    // ============================================================

    $complaintReference =
        'MAL-COM-' .
        date('Y') .
        '-' .
        str_pad(
            $id,
            6,
            '0',
            STR_PAD_LEFT
        );


    // Save public reference
    $referenceStmt = $pdo->prepare("
        UPDATE tbl_complaints
        SET complaintReference = :reference
        WHERE complaintID = :complaintID
    ");


    $referenceStmt->execute([
        ":reference" => $complaintReference,
        ":complaintID" => $id
    ]);


    // ============================================================
    // SAVE AI ANALYSIS
    // ============================================================

    $aiStmt = $pdo->prepare("
        INSERT INTO tbl_ai_analysis
        (
            complaintID,
            category,
            urgency,
            location,
            summary,
            confidence,
            containsProfanity,
            imageAnalysis,
            imageMatch,
            imageMatchConfidence,
            verificationFlag,
            mediaSafety,
            mediaSafetyConfidence,
            mediaSafetyReason,
            analyzedAt
        )
        VALUES
        (
            :complaintID,
            :category,
            :urgency,
            :location,
            :summary,
            :confidence,
            :containsProfanity,
            :imageAnalysis,
            :imageMatch,
            :imageMatchConfidence,
            :verificationFlag,
            :mediaSafety,
            :mediaSafetyConfidence,
            :mediaSafetyReason,
            NOW()
        )
    ");


    $aiStmt->execute([
        ":complaintID" => $id,
        ":category" => $category,
        ":urgency" => $urgency,
        ":location" => $location,
        ":summary" => $summary,
        ":confidence" => $confidence,
        ":containsProfanity" => $profanity ? 1 : 0,
        ":imageAnalysis" => $imageAnalysis,
        ":imageMatch" => $imageMatch,
        ":imageMatchConfidence" => $imageMatchConfidence,
        ":verificationFlag" => $verificationFlag ? 1 : 0,
        ":mediaSafety" => $mediaSafety,
        ":mediaSafetyConfidence" => $mediaSafetyConfidence,
        ":mediaSafetyReason" => $mediaSafetyReason
    ]);


    // ============================================================
    // SAVE LOCATION
    // ============================================================

    if (
        $latitude !== null &&
        $longitude !== null
    ) {

        $locationStmt = $pdo->prepare("
            INSERT INTO tbl_complaint_locations
            (
                complaintID,
                latitude,
                longitude,
                accuracy
            )
            VALUES
            (
                :complaintID,
                :latitude,
                :longitude,
                :accuracy
            )
        ");


        $locationStmt->execute([
            ":complaintID" => $id,
            ":latitude" => $latitude,
            ":longitude" => $longitude,
            ":accuracy" => $accuracy
        ]);
    }


    // ============================================================
    // SAVE ATTACHMENT
    // ============================================================

    $stmt = $pdo->prepare("
        INSERT INTO tbl_attachments
        (
            complaintID,
            fileName,
            filePath,
            fileType,
            uploadedAt
        )
        VALUES
        (
            :id,
            :fn,
            :fp,
            :ft,
            NOW()
        )
    ");


    $stmt->execute([
        ":id" => $id,
        ":fn" => $newName,
        ":fp" => $webPath,
        ":ft" => $mime
    ]);


    // ============================================================
    // CONSUME EMERGENCY COMPLAINT
    // ============================================================

    if (
        !$isVerified &&
        $urgency === 'HIGH'
    ) {

        $emergencyStmt = $pdo->prepare("
            UPDATE tbl_citizens
            SET emergencyComplaintUsed = 1
            WHERE citizenID = :citizenID
              AND emergencyComplaintUsed = 0
        ");


        $emergencyStmt->execute([
            ":citizenID" => $citizenID
        ]);


        if (
            $emergencyStmt->rowCount() !== 1
        ) {

            throw new Exception(
                "Your emergency complaint allowance is no longer available."
            );
        }
    }


    $pdo->commit();

    // Logging failure must not undo a successfully saved complaint.
    try {
        logOperation(
            $pdo,
            "citizen",
            (int)$citizenID,
            $_SESSION['user_email'] ?? "Unknown Citizen",
            "Complaint Submitted",
            "Citizen submitted a new complaint.",
            (int)$id,
            null,
            "Status: Pending | Category: {$category} | Urgency: {$urgency}"
        );
    } catch (Throwable $logError) {
        error_log(
            "Complaint submission logging failed: " .
            $logError->getMessage()
        );
    }


} catch (Throwable $e) {

    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    @unlink(
        $uploadDir . $newName
    );

    respond([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}


respond([
    "status" => "success",
    "category" => $category,
    "urgency" => $urgency,
    "summary" => $summary,
    "confidence" => $confidence,
    "image" => $webPath
]);
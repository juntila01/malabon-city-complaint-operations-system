<?php

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

/**
 * Send a citizen notification email.
 *
 * Returns true if PHPMailer sends successfully,
 * or false if sending fails.
 */
function sendCitizenNotificationEmail(
    string $email,
    string $citizenName,
    string $title,
    string $message,
    ?string $complaintReference = null
): bool {

    try {

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return false;
        }

        $baseDir = __DIR__;

        require_once $baseDir . "/../PHPMailer/src/Exception.php";
        require_once $baseDir . "/../PHPMailer/src/PHPMailer.php";
        require_once $baseDir . "/../PHPMailer/src/SMTP.php";

        $mailConfig = require $baseDir . "/mail_config.php";

        $mail = new PHPMailer(true);

        $mail->isSMTP();
        $mail->Host = "smtp.gmail.com";
        $mail->SMTPAuth = true;
        $mail->Username = $mailConfig["username"];
        $mail->Password = $mailConfig["password"];
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port = 587;

        $mail->CharSet = "UTF-8";

        $mail->setFrom(
            $mailConfig["from_email"],
            $mailConfig["from_name"]
        );

        $mail->addAddress($email, $citizenName);

        $safeName = htmlspecialchars(
            $citizenName,
            ENT_QUOTES,
            "UTF-8"
        );

        $safeTitle = htmlspecialchars(
            $title,
            ENT_QUOTES,
            "UTF-8"
        );

        $safeMessage = nl2br(
            htmlspecialchars(
                $message,
                ENT_QUOTES,
                "UTF-8"
            )
        );

        $safeReference = htmlspecialchars(
            (string) $complaintReference,
            ENT_QUOTES,
            "UTF-8"
        );

        $mail->isHTML(true);
        $mail->Subject = $title . " - MCAT Complaint Management System";

        $referenceHtml = "";

        if ($complaintReference !== null && $complaintReference !== "") {
            $referenceHtml = "
                <p style='margin-top:20px;'>
                    <strong>Complaint Reference:</strong><br>
                    {$safeReference}
                </p>
            ";
        }

        $mail->Body = "
            <!DOCTYPE html>
            <html>
            <body style='
                margin:0;
                padding:24px;
                background:#f3f4f6;
                font-family:Arial,sans-serif;
                color:#1f2937;
            '>
                <div style='
                    max-width:600px;
                    margin:0 auto;
                    padding:32px;
                    background:#ffffff;
                    border-radius:12px;
                '>
                    <h2 style='color:#2563eb;'>
                        MCAT Notification
                    </h2>

                    <p>Hello {$safeName},</p>

                    <h3>{$safeTitle}</h3>

                    <p style='line-height:1.7;'>
                        {$safeMessage}
                    </p>

                    {$referenceHtml}

                    <hr style='
                        margin-top:28px;
                        border:none;
                        border-top:1px solid #e5e7eb;
                    '>

                    <p style='
                        font-size:12px;
                        color:#6b7280;
                    '>
                        This is an automated notification from the
                        MCAT Complaint Management System.
                        Please do not reply directly to this email.
                    </p>
                </div>
            </body>
            </html>
        ";

        $mail->AltBody =
            "MCAT Notification\n\n" .
            "Hello {$citizenName},\n\n" .
            "{$title}\n\n" .
            "{$message}\n\n" .
            (
                $complaintReference
                    ? "Complaint Reference: {$complaintReference}\n\n"
                    : ""
            ) .
            "MCAT Complaint Management System";

        $mail->send();

        return true;

    } catch (\Throwable $e) {

        error_log(
            "Citizen notification email failed: " .
            $e->getMessage()
        );

        return false;
    }
}
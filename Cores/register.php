<?php
session_start();

// Your Database Configuration
require_once "../db.php";
require_once "../Reports/log_operation.php";


if ($_SERVER["REQUEST_METHOD"] == "POST") {
    
    // 1. Text Inputs Sanitization
    $fullName         = trim($_POST['fullname'] ?? '');
    $email            = filter_var(trim($_POST['email'] ?? ''), FILTER_SANITIZE_EMAIL);
    $contactNumber    = trim($_POST['contact_number'] ?? '');
    $password         = $_POST['password'] ?? '';
    $confirm_password = $_POST['confirm_password'] ?? '';

    // 2. Standard Text Fields Validation
    if (empty($fullName) || empty($email) || empty($contactNumber) || empty($password) || empty($confirm_password)) {
        header("Location: register.html?error=empty_fields");
        exit();
    }
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        header("Location: register.html?error=invalid_email");
        exit();
    }
    if (!preg_match("/^[0-9]{11}$/", $contactNumber)) {
        header("Location: register.html?error=invalid_contact");
        exit();
    }
    if ($password !== $confirm_password) {
        header("Location: register.html?error=password_mismatch");
        exit();
    }
    if (strlen($password) < 8) {
        header("Location: register.html?error=password_too_short");
        exit();
    }

    // Default status for a new account without an attachment
    $verificationStatus = 'Unverified'; 

    try {
        // 3. Check if email already exists
        $sql_check = "SELECT citizenID FROM tbl_citizens WHERE email = :email LIMIT 1";
        $stmt_check = $pdo->prepare($sql_check);
        $stmt_check->execute([':email' => $email]);

        if ($stmt_check->rowCount() > 0) {
            header("Location: register.html?error=email_exists");
            exit();
        }

        // 4. Hash the password securely
        $passwordHash = password_hash($password, PASSWORD_BCRYPT);

        // 5. Insert pure registration details (omitting the attachment column)
        $sql_insert = "INSERT INTO tbl_citizens 
               (fullName, email, authProvider, contactNumber, passwordHash, verificationStatus) 
               VALUES 
               (:fullName, :email, 'local', :contactNumber, :passwordHash, :verificationStatus)";
        
        $stmt_insert = $pdo->prepare($sql_insert);
        $executed = $stmt_insert->execute([
            ':fullName'           => $fullName,
            ':email'              => $email,
            ':contactNumber'      => $contactNumber,
            ':passwordHash'       => $passwordHash,
            ':verificationStatus' => $verificationStatus 
        ]);

        if ($executed) {

         // ============================================================
        // OPERATIONAL LOG
        // ============================================================

        $newCitizenID = (int) $pdo->lastInsertId();

        logOperation(
            $pdo,
            'citizen',
            $newCitizenID,
            $fullName,
            'Citizen Registration',
            "New citizen account registered with email {$email}.",
            null,
            null,
            'Registered'
        );
            header("Location: login.html?registration=success");
            exit();
        } else {
            header("Location: register.html?error=generic_error");
            exit();
        }

    } catch (\PDOException $e) {
        // Output actual SQL error string to debug locally instead of hiding behind a blind redirect
        die("Database Insertion Failure: " . $e->getMessage());
    }
}
?>
<?php

$host = "localhost";
$dbname = "complaintdb";   // Your database name
$username = "root";          // Your MySQL username
$password = "";              // Your MySQL password

try {
    $pdo = new PDO(
        "mysql:host=$host;dbname=$dbname;charset=utf8",
        $username,
        $password
    );


        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        // Use Philippine time for this MySQL connection.
        $pdo->exec("SET time_zone = '+08:00'");


} catch(PDOException $e){
    die("Connection failed: " . $e->getMessage());
}

?>
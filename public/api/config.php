<?php
// public/api/config.php

// Database Configuration
// In production, these should be env variables or secure credentials
$db_host = 'localhost';
$db_name = 'kadishim_db';
$db_user = 'root';
$db_pass = '';

try {
    $pdo = new PDO("mysql:host=$db_host;dbname=$db_name;charset=utf8mb4", $db_user, $db_pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    // For development/mocking, we might suppress connection errors if DB isn't real yet
    // die("Connection failed: " . $e->getMessage());
    $pdo = null;
}
?>
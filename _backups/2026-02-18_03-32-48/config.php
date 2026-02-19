<?php
// public/api/config.php

// Database Configuration
// In production, these should be env variables or secure credentials
$db_host = 'localhost';
$db_name = 'kadishim_new';
$db_user = 'kadishim_New';
$db_pass = 'KadishimDB1234@';

try {
    $pdo = new PDO("mysql:host=$db_host;dbname=$db_name;charset=utf8mb4", $db_user, $db_pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

    // Auto-create tables if they don't exist (Lazy Setup)
    $sql = "
    CREATE TABLE IF NOT EXISTS messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        message TEXT NOT NULL,
        status ENUM('new', 'read', 'replied') DEFAULT 'new',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS kaddish_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        requester_name VARCHAR(255) NOT NULL,
        requester_email VARCHAR(255) NOT NULL,
        requester_phone VARCHAR(50),
        deceased_name VARCHAR(255) NOT NULL,
        relationship VARCHAR(100),
        father_name VARCHAR(255),
        mother_name VARCHAR(255),
        gender ENUM('son_of', 'daughter_of'),
        death_date_hebrew VARCHAR(100),
        death_date_gregorian DATE,
        is_after_sunset BOOLEAN DEFAULT FALSE,
        status ENUM('new', 'approved', 'completed') DEFAULT 'new',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS subscribers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE,
        phone VARCHAR(50),
        name VARCHAR(255),
        source VARCHAR(50) DEFAULT 'website',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    ";

    // Silence errors during auto-creation attempt
    try {
        $pdo->exec($sql);
    } catch (Exception $e) {
    }

} catch (PDOException $e) {
    // For development/mocking, we might suppress connection errors if DB isn't real yet
    // die("Connection failed: " . $e->getMessage());
    $pdo = null;
}
?>
<?php
require_once 'config.php';

if (!$pdo) {
    die("Database connection failed. Check config.php");
}

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

try {
    $pdo->exec($sql);
    echo "<h1>Database Setup Complete!</h1><p>Tables 'messages', 'kaddish_requests', and 'subscribers' created successfully.</p>";
} catch (PDOException $e) {
    echo "<h1>Error</h1><p>" . $e->getMessage() . "</p>";
}
?>
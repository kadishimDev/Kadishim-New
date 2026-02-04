-- Database Schema for Kadishim Website

CREATE TABLE IF NOT EXISTS `memorials` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `uuid` VARCHAR(255) UNIQUE COMMENT 'Legacy or External ID',
    `full_name` VARCHAR(255) NOT NULL,
    `father_name` VARCHAR(255),
    `mother_name` VARCHAR(255),
    `hebrew_date` VARCHAR(100) COMMENT 'Original Hebrew Date String',
    `passing_date_geo` DATE,
    `type` ENUM('kaddish', 'mishnayot', 'candle', 'tehillim', 'other') DEFAULT 'kaddish',
    `status` ENUM('active', 'archived') DEFAULT 'active',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `requests` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `deceased_name` VARCHAR(255) NOT NULL,
    `father_name` VARCHAR(255),
    `mother_name` VARCHAR(255),
    `passing_date_heb` VARCHAR(100),
    `passing_date_geo` DATE,
    `gender` ENUM('male', 'female'),
    `tribe` ENUM('israel', 'cohen', 'levi'),
    `services_requested` JSON COMMENT 'Array of requested services: ["kaddish", "mishnayot"]',
    `requester_name` VARCHAR(255),
    `requester_email` VARCHAR(255),
    `requester_phone` VARCHAR(50),
    `is_approved` BOOLEAN DEFAULT FALSE,
    `admin_notes` TEXT,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

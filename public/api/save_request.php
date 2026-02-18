<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once 'config.php';

$data = json_decode(file_get_contents("php://input"), true);

// Basic validation
if (!isset($data['requester_name']) || !isset($data['deceased_name'])) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Missing required fields"]);
    exit;
}

// 1. Save to Database
$requestId = 0;
if ($pdo) {
    try {
        $stmt = $pdo->prepare("INSERT INTO kaddish_requests 
            (requester_name, requester_email, requester_phone, deceased_name, relationship, father_name, mother_name, gender, death_date_hebrew, death_date_gregorian, is_after_sunset, 
            memorial_children, memorial_residence, deceased_residence_country, 
            requester_city, requester_street, requester_building, requester_apartment, requester_zip, requester_country) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

        $stmt->execute([
            $data['requester_first_name'] . ' ' . $data['requester_last_name'], // Combine names
            $data['requester_email'],
            $data['requester_phone_prefix'] . '-' . $data['requester_phone'], // Combine phone
            $data['deceased_first_name'] . ' ' . $data['deceased_last_name'], // Combine names
            $data['relationship'] ?? '',
            $data['father_name'] ?? '',
            $data['mother_name'] ?? '',
            $data['deceased_gender'] ?? 'son_of', // Changed from gender
            $data['death_date_hebrew'] ?? '',
            $data['gregorian_death_date'] ?? null, // Changed from death_date_gregorian
            isset($data['death_after_sunset']) ? ($data['death_after_sunset'] ? 1 : 0) : 0,

            // New Fields
            $data['memorial_children'] ?? '',
            $data['memorial_residence'] ?? '',
            $data['deceased_residence_country'] ?? '',
            $data['requester_city'] ?? '',
            $data['requester_street'] ?? '',
            $data['requester_house_number'] ?? '', // Mapped to building column
            $data['requester_apartment'] ?? '',
            $data['requester_zip'] ?? '',
            $data['requester_country'] ?? ''
        ]);
        $requestId = $pdo->lastInsertId();
    } catch (Exception $e) {
        error_log("DB Error: " . $e->getMessage());
    }
}

// 2. Send Email
// 2. Send Email
require_once 'lib/MailService.php';
$config = require 'smtp_config.php';
$mailService = new MailService($config, 'service'); // Use 'service' account as sender

$to = 'reqeuest@kadishim.co.il'; // Send TO request account
$subject = "בקשת קדיש חדשה עבור: " . $data['deceased_name'];
$body = $data['html'];

$result = $mailService->send($to, $subject, $body);

if ($result['success']) {
    echo json_encode(["success" => true, "message" => "Request saved and email sent", "id" => $requestId]);
} else {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Failed to send email: " . ($result['error'] ?? ''), "db_saved" => $requestId > 0]);
}
?>
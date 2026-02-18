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

if (!isset($data['name']) || !isset($data['email']) || !isset($data['message'])) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Missing required fields"]);
    exit;
}

// 1. Save to Database
$messageId = 0;
if ($pdo) {
    try {
        $stmt = $pdo->prepare("INSERT INTO messages (name, email, phone, message) VALUES (?, ?, ?, ?)");
        $stmt->execute([
            $data['name'],
            $data['email'],
            $data['phone'] ?? '',
            $data['message']
        ]);
        $messageId = $pdo->lastInsertId();
    } catch (Exception $e) {
        // Log error but continue to send email
        error_log("DB Error: " . $e->getMessage());
    }
}

// 2. Send Email
require_once 'lib/MailService.php';
$config = require 'smtp_config.php';
$mailService = new MailService($config, 'service'); // Use 'service' account (sender)

$to = 'contact@kadishim.co.il'; // Send TO contact account
$subject = "פנייה חדשה מאתר קדישים: " . $data['name'];
$body = $data['html'] ?? $data['message'];

$result = $mailService->send($to, $subject, $body);

if ($result['success']) {
    echo json_encode(["success" => true, "message" => "Message saved and email sent", "id" => $messageId]);
} else {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Failed to send email: " . ($result['error'] ?? ''), "db_saved" => $messageId > 0]);
}
?>
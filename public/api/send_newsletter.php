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
require_once 'lib/MailService.php';
$config = require 'smtp_config.php';

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['subject']) || !isset($data['body'])) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Missing subject or body"]);
    exit;
}

$subject = $data['subject']; // Subject from admin
$body = $data['body'];       // HTML body from admin

// If specific recipients provided (e.g. test)
if (isset($data['recipients']) && is_array($data['recipients'])) {
    $emails = $data['recipients'];
} else {
    // Fetch all unique emails from messages, kaddish_requests, and subscribers
    $emails = [];
    if ($pdo) {
        try {
            // 1. Subscribers
            $stmt = $pdo->query("SELECT DISTINCT email FROM subscribers WHERE email IS NOT NULL AND email != ''");
            while ($row = $stmt->fetch()) {
                $emails[] = $row['email'];
            }

            // 2. Messages (Contact Forms)
            $stmt = $pdo->query("SELECT DISTINCT email FROM messages WHERE email IS NOT NULL AND email != ''");
            while ($row = $stmt->fetch()) {
                $emails[] = $row['email'];
            }

            // 3. Kaddish Requests
            $stmt = $pdo->query("SELECT DISTINCT requester_email FROM kaddish_requests WHERE requester_email IS NOT NULL AND requester_email != ''");
            while ($row = $stmt->fetch()) {
                $emails[] = $row['requester_email'];
            }
        } catch (Exception $e) {
            // Log error
        }
    }
    // Remove duplicates
    $emails = array_unique($emails);
}

if (empty($emails)) {
    echo json_encode(["success" => false, "message" => "No recipients found"]);
    exit;
}

// Send Emails
// Use 'service' account for mass mailing
$mailService = new MailService($config, 'service');

$sentCount = 0;
$failCount = 0;

foreach ($emails as $email) {
    // Add Unsubscribe link or footer to body?
    $footer = "<br><hr><small>You received this email because you contacted Kadishim.co.il.</small>";
    $fullBody = $body . $footer;

    $result = $mailService->send($email, $subject, $fullBody);
    if ($result['success']) {
        $sentCount++;
    } else {
        $failCount++;
        error_log("Newsletter failed for $email: " . ($result['error'] ?? 'Unknown'));
    }

    // Slight pause to be nice to the SMTP server?
    // usleep(100000); // 100ms
}

echo json_encode([
    "success" => true,
    "message" => "Newsletter complete. Sent: $sentCount, Failed: $failCount",
    "details" => ["sent" => $sentCount, "failed" => $failCount]
]);
?>
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

if (!isset($data['id']) || !isset($data['subject']) || !isset($data['body'])) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Missing required fields"]);
    exit;
}

$id = $data['id'];
$subject = $data['subject'];
$body = $data['body'];

if ($pdo) {
    try {
        // 1. Get original message to find recipient email
        $stmt = $pdo->prepare("SELECT email, name FROM messages WHERE id = ?");
        $stmt->execute([$id]);
        $message = $stmt->fetch();

        if (!$message) {
            http_response_code(404);
            echo json_encode(["success" => false, "message" => "Message not found"]);
            exit;
        }

        $toEmail = $message['email'];
        $toName = $message['name'];

        // 2. Send Email
        // We use the 'service' account to send the reply
        $mailService = new MailService($config, 'service');

        $fullSubject = "Re: " . $subject; // Ensure Re: prefix if not present? Or let admin decide.
        // Let's just use the subject provided by admin.

        // Wrap body in a nice template?
        $htmlBody = "
        <div dir='rtl' style='font-family: Arial, sans-serif; line-height: 1.6;'>
            <p>שלום $toName,</p>
            <p>$body</p>
            <br>
            <hr>
            <p style='color: gray; font-size: 12px;'>בברכה,<br>צוות אתר קדישים<br>service@kadishim.co.il</p>
        </div>
        ";

        $result = $mailService->send($toEmail, $subject, $htmlBody);

        if ($result['success']) {
            // 3. Update status to 'replied'
            $updateStmt = $pdo->prepare("UPDATE messages SET status = 'replied' WHERE id = ?");
            $updateStmt->execute([$id]);

            echo json_encode(["success" => true, "message" => "Reply sent successfully"]);
        } else {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Failed to send email: " . $result['error']]);
        }

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "DB Error: " . $e->getMessage()]);
    }
} else {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Database connection failed"]);
}
?>
<?php
header("Content-Type: text/html; charset=UTF-8");
require_once 'lib/MailService.php';
$config = require 'smtp_config.php';

$accounts = ['service', 'contact', 'request'];
$to = "service@kadishim.co.il"; // Send to service account (central inbox)

echo "<h1>SMTP Test Script</h1>";
echo "<p>Sending test emails to: $to</p>";

foreach ($accounts as $account) {
    echo "<hr><h3>Testing Account: $account</h3>";

    $mailService = new MailService($config, $account);
    $subject = "Test Email from $account (" . date('H:i:s') . ")";
    $body = "This is a test email sent via basic SMTP auth from the <b>$account</b> account.";

    $result = $mailService->send($to, $subject, $body);

    if ($result['success']) {
        echo "<p style='color:green'>✅ SUCCESS: Email sent successfully.</p>";
    } else {
        echo "<p style='color:red'>❌ FAILURE: " . ($result['error'] ?? 'Unknown error') . "</p>";
    }
}
?>
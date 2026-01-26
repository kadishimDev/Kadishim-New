<?php
// public/api/save_request.php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *"); // For dev
header("Access-Control-Allow-Methods: POST");

// 1. Setup Configuration
$admin_email = "your-email@example.com"; // UPDATE THIS
$subject = "בקשה חדשה לקדיש - מהאתר החדש";

$response = ["success" => false, "message" => "Unknown error"];

// 2. Check if form was submitted
if ($_SERVER["REQUEST_METHOD"] == "POST") {

    // Collect and Sanitize Input
    $deceased_name = htmlspecialchars($_POST['deceased_name'] ?? '');
    $father_name = htmlspecialchars($_POST['father_name'] ?? '');
    $requester_email = filter_var($_POST['requester_email'] ?? '', FILTER_SANITIZE_EMAIL);

    // 3. Prepare Email Message
    $message = "
    התקבלה בקשה חדשה:
    -----------------
    שם הנפטר: $deceased_name
    שם האב: $father_name
    מייל המבקש: $requester_email
    ";

    $headers = "From: webmaster@kadishim.co.il" . "\r\n" .
        "Reply-To: $requester_email" . "\r\n" .
        "X-Mailer: PHP/" . phpversion();

    // 4. Send Email
    $mail_success = mail($admin_email, $subject, $message, $headers);

    // 5. Database Insertion (Placeholder)
    /*
    require '../config.php';
    if(isset($pdo)) {
        // Insert...
    }
    */

    if ($mail_success) {
        $response = ["success" => true, "message" => "Email sent successfully"];
    } else {
        // For development on localhost without mail server, we might fake success
        // $response = ["success" => true, "message" => "Simulated success (no mail server)"];
        $response = ["success" => false, "message" => "Mail server error"];
    }
}

echo json_encode($response);
?>
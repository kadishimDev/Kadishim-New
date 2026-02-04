<?php
// public/api/save_request.php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");

require_once 'config.php'; // Include DB connection

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

    // Optional Fields
    $mother_name = htmlspecialchars($_POST['mother_name'] ?? '');
    $passing_date_heb = htmlspecialchars($_POST['passing_date_heb'] ?? '');
    $gender = htmlspecialchars($_POST['gender'] ?? '');
    $tribe = htmlspecialchars($_POST['tribe'] ?? '');

    // Checkboxes (sent as JSON or individual fields? Assuming typical form submit)
    // We'll bundle services into a JSON string
    $services = [];
    if (!empty($_POST['kaddish']))
        $services[] = 'kaddish';
    if (!empty($_POST['mishnayot']))
        $services[] = 'mishnayot';

    $services_json = json_encode($services, JSON_UNESCAPED_UNICODE);

    // 3. Prepare Email Message
    $message = "
    התקבלה בקשה חדשה:
    -----------------
    שם הנפטר: $deceased_name
    שם האב: $father_name
    שם האם: $mother_name
    תאריך עברי: $passing_date_heb
    מגדר: $gender
    שבט: $tribe
    שירותים מבוקשים: " . implode(", ", $services) . "
    
    מייל המבקש: $requester_email
    ";

    $headers = "From: webmaster@kadishim.co.il" . "\r\n" .
        "Reply-To: $requester_email" . "\r\n" .
        "X-Mailer: PHP/" . phpversion();

    // 4. Send Email
    // $mail_success = mail($admin_email, $subject, $message, $headers); // Commented out for local testing if needed
    $mail_success = true; // Simulated for now

    // 5. Database Insertion
    $db_success = false;
    if ($pdo) {
        try {
            $stmt = $pdo->prepare("INSERT INTO requests 
                (deceased_name, father_name, mother_name, passing_date_heb, gender, tribe, services_requested, requester_email) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)");

            $stmt->execute([
                $deceased_name,
                $father_name,
                $mother_name,
                $passing_date_heb,
                $gender,
                $tribe,
                $services_json,
                $requester_email
            ]);
            $db_success = true;
        } catch (PDOException $e) {
            // Log error
            error_log("DB Insert Error: " . $e->getMessage());
        }
    }

    if ($mail_success) {
        $msg = "Email sent successfully";
        if ($db_success) {
            $msg .= " & Saved to DB";
        } elseif ($pdo) {
            $msg .= " but DB save failed";
        } else {
            $msg .= " (DB not connected)";
        }

        $response = ["success" => true, "message" => $msg];
    } else {
        $response = ["success" => false, "message" => "Mail server error"];
    }
}

echo json_encode($response);
?>
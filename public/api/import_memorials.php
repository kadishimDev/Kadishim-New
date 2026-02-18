<?php
require_once 'config.php';

// Prevent unauthorized access in production (basic protection)
// In a real scenario, this should be protected by admin session or key
$jsonFile = '../../src/data/memorials_v2.json';

if (!file_exists($jsonFile)) {
    die(json_encode(["error" => "JSON file not found at $jsonFile"]));
}

$jsonData = file_get_contents($jsonFile);
$memorials = json_decode($jsonData, true);

if (!$memorials) {
    die(json_encode(["error" => "Failed to decode JSON"]));
}

$count = 0;
$errors = [];

try {
    // Check if DB is empty to avoid duplicates
    $check = $pdo->query("SELECT COUNT(*) FROM kaddish_requests");
    if ($check->fetchColumn() > 0) {
        die(json_encode(["message" => "Database table is not empty. Skipping import to avoid duplicates. (Clear table to re-import)"]));
    }

    $stmt = $pdo->prepare("INSERT INTO kaddish_requests 
        (requester_name, requester_email, requester_phone, deceased_name, father_name, mother_name, gender, death_date_hebrew, death_date_gregorian, status, created_at) 
        VALUES 
        (:r_name, :r_email, :r_phone, :d_name, :f_name, :m_name, :gender, :h_date, :g_date, 'approved', :created_at)");

    foreach ($memorials as $item) {
        // Mapping
        $gender = ($item['gender'] === 'female') ? 'daughter_of' : 'son_of';

        // Requester Info (Map contact_* to requester_*)
        $rName = $item['contact_name'] ?? 'Unknown';
        $rEmail = $item['contact_email'] ?? '';
        $rPhone = $item['contact_phone'] ?? '';

        // Dates
        $gDate = $item['gregorian_date'];
        if (empty($gDate) || $gDate == '0000-00-00')
            $gDate = null;

        $params = [
            ':r_name' => $rName,
            ':r_email' => $rEmail,
            ':r_phone' => $rPhone,
            ':d_name' => $item['name'] ?? 'Unknown',
            ':f_name' => $item['father_name'] ?? '',
            ':m_name' => $item['mother_name'] ?? '',
            ':gender' => $gender,
            ':h_date' => $item['hebrew_date_text'] ?? '',
            ':g_date' => $gDate,
            ':created_at' => $item['created_at'] ?? date('Y-m-d H:i:s')
        ];

        try {
            $stmt->execute($params);
            $count++;
        } catch (Exception $ex) {
            $errors[] = "ID " . ($item['id'] ?? '?') . ": " . $ex->getMessage();
        }
    }

    echo json_encode([
        "success" => true,
        "imported_count" => $count,
        "total_in_json" => count($memorials),
        "errors" => array_slice($errors, 0, 10) // Show first 10 errors
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database error: " . $e->getMessage()]);
}
?>
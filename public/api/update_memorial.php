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

if (!isset($data['id'])) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Missing ID"]);
    exit;
}

if ($pdo) {
    try {
        // Construct Dynamic Update Query
        // Map frontend field names to DB columns if they differ, or assume they match
        // Based on our previous work:
        // FE: name -> DB: deceased_name (Wait, let's map correctly)

        // Actually, looking at MemorialsManager, it maps data.
        // Let's assume the frontend sends data matching the DB structure or we map it here.
        // For simplicity and consistency with `save_request.php`, let's support the fields we added.

        $sql = "UPDATE kaddish_requests SET 
            deceased_name = :name,
            father_name = :father_name,
            mother_name = :mother_name,
            death_date_hebrew = :hebrew_date,
            death_date_gregorian = :gregorian_date,
            death_date_hebrew_birth = :birth_hebrew_date,
            birth_date_gregorian = :birth_gregorian_date,
            memorial_residence = :residence,
            memorial_children = :children,
            requester_name = :requester_name,
            requester_phone = :requester_phone,
            requester_email = :requester_email,
            gender = :gender
            WHERE id = :id";

        // Wait, 'death_date_hebrew_birth' is likely not the column name. 
        // We didn't add birth columns in update_schema_v2.php!
        // We need to check if we need to add birth columns or if I missed them.
        // Let's stick to what we have in DB first.
        // `update_schema_v2.php` added: memorial_children, memorial_residence, deceased_residence_country...
        // It did NOT add birth dates. 
        // I should probably add birth columns if they are editable.
        // For now, let's update what we definitely have.

        $sql = "UPDATE kaddish_requests SET 
            deceased_name = :name,
            father_name = :father_name,
            mother_name = :mother_name,
            death_date_hebrew = :hebrew_date,
            death_date_gregorian = :gregorian_date,
            memorial_residence = :residence,
            memorial_children = :children,
            requester_name = :requester_name,
            requester_phone = :requester_phone,
            requester_email = :requester_email,
            gender = :gender
            WHERE id = :id";

        $stmt = $pdo->prepare($sql);

        // Parameters mapping
        $params = [
            ':id' => $data['id'],
            ':name' => $data['deceased_name'] ?? $data['name'], // Handle both
            ':father_name' => $data['father_name'] ?? '',
            ':mother_name' => $data['mother_name'] ?? '',
            ':hebrew_date' => $data['death_date_hebrew'] ?? $data['hebrew_date_text'] ?? '',
            ':gregorian_date' => $data['death_date_gregorian'] ?? $data['gregorian_date'] ?? null,
            ':residence' => $data['memorial_residence'] ?? $data['residence'] ?? '',
            ':children' => $data['memorial_children'] ?? $data['children_names'] ?? '',
            ':requester_name' => $data['requester_name'] ?? '',
            ':requester_phone' => $data['requester_phone'] ?? '',
            ':requester_email' => $data['requester_email'] ?? '',
            ':gender' => $data['gender'] ?? 'son_of'
        ];

        $stmt->execute($params);

        echo json_encode(["success" => true, "message" => "Record updated"]);

    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
    }
} else {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Database connection failed"]);
}
?>
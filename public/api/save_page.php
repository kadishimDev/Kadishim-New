<?php
header("Content-Type: application/json; charset=UTF-8");
require_once 'config.php';

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['slug']) || !isset($data['title'])) {
    http_response_code(400);
    echo json_encode(["error" => "Missing required fields (slug, title)"]);
    exit;
}

$slug = $data['slug'];
$title = $data['title'];
$content = isset($data['content']) ? $data['content'] : '';
$isVisible = isset($data['isVisible']) ? (int) $data['isVisible'] : 1;

try {
    // Check if page exists
    $stmt = $pdo->prepare("SELECT id FROM kaddish_pages WHERE slug = ?");
    $stmt->execute([$slug]);
    $exists = $stmt->fetch();

    if ($exists) {
        // Update
        $sql = "UPDATE kaddish_pages SET title = ?, content = ?, isVisible = ? WHERE slug = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$title, $content, $isVisible, $slug]);
    } else {
        // Insert
        $sql = "INSERT INTO kaddish_pages (slug, title, content, isVisible) VALUES (?, ?, ?, ?)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$slug, $title, $content, $isVisible]);
    }

    echo json_encode(["message" => "Page saved successfully"]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database error: " . $e->getMessage()]);
}
?>
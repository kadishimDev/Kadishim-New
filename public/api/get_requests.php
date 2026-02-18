<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once 'config.php';

if ($pdo) {
    try {
        $stmt = $pdo->query("SELECT * FROM kaddish_requests ORDER BY created_at DESC");
        $requests = $stmt->fetchAll();
        echo json_encode($requests);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "Database error: " . $e->getMessage()]);
    }
} else {
    echo json_encode([]);
}
?>
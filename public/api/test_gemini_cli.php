<?php
// public/api/test_gemini_cli.php
// Quick debug script to be run from command line: php public/api/test_gemini_cli.php

echo "--- Starting Gemini API Test ---\n";

$config = require 'public/api/config.php';
$apiKey = $config['GEMINI_API_KEY'];

echo "API Key Length: " . strlen($apiKey) . "\n";
echo "API Key (First 5): " . substr($apiKey, 0, 5) . "...\n";

$apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=$apiKey";

$data = [
    "contents" => [
        [
            "parts" => [
                ["text" => "Say Hello"]
            ]
        ]
    ]
];

echo "Connecting to: $apiUrl\n";

$ch = curl_init($apiUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
// IMPORTANT FOR DEBUGGING:
curl_setopt($ch, CURLOPT_VERBOSE, true);
// Fix for potential local SSL certificate issues:
// curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // Only uncomment if SSL fails

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

echo "\n--- Result ---\n";
echo "HTTP Code: $httpCode\n";
if ($curlError) {
    echo "CURL Error: $curlError\n";
} else {
    echo "Response Length: " . strlen($response) . "\n";
    echo "Response Snippet: " . substr($response, 0, 500) . "\n";
}
echo "\n--- End Test ---\n";
?>
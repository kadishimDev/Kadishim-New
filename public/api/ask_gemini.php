<?php
/**
 * ask_gemini.php
 * Proxies requests to Google Gemini API to avoid exposing the key and to handle context injection.
 */

header('Content-Type: application/json; charset=utf-8');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

$config = require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// 1. Get Input
$input = json_decode(file_get_contents('php://input'), true);
$userPrompt = $input['prompt'] ?? '';
$systemContext = $input['context'] ?? ''; // e.g. "Current page is Home, available pages: [...]"

if (!$userPrompt) {
    echo json_encode(['error' => 'No prompt provided']);
    exit;
}

$apiKey = $config['GEMINI_API_KEY'];
$apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=$apiKey";

// 2. Construct System Prompt (The "Ghost in the Machine")
$systemInstruction = "
You are the 'Kadishim Commander', an AI agent controlling a memorial website admin panel.
Your goal is to translate user requests (Hebrew/English) into JSON commands.

AVAILABLE COMMANDS:
1. { \"type\": \"nav\", \"target\": \"settings\" | \"memorials\" | \"pages\" | \"dashboard\", \"params\": { ... } }
2. { \"type\": \"action\", \"action\": \"SCAN\" | \"CLEAR_LOGS\" }
3. { \"type\": \"design\", \"action\": \"THEME_DARK\" | \"THEME_LIGHT\" | \"FONT_INC\" | \"FONT_DEC\" | \"COLOR_BLUE\" | \"COLOR_ORANGE\" }
4. { \"type\": \"content\", \"action\": \"UPDATE_TITLE\", \"payload\": { \"page\": \"slug\", \"title\": \"new text\" } }
5. { \"type\": \"content\", \"action\": \"UPDATE_CONTENT\", \"payload\": { \"page\": \"slug\", \"content\": \"html content\" } }

CONTEXT:
$systemContext

RULES:
- Return ONLY JSON. No markdown formatting.
- If unsure, return { \"type\": \"error\", \"msg\": \"...explanation...\" }
- If the user asks to write content (e.g. \"Write a touching intro for the home page\"), generate it and use UPDATE_CONTENT.
- Be strictly JSON compliant.
";

// 3. Payload
$data = [
    "contents" => [
        [
            "parts" => [
                ["text" => $systemInstruction . "\n\nUSER REQUEST: " . $userPrompt]
            ]
        ]
    ],
    "generationConfig" => [
        "temperature" => 0.4,
        "responseMimeType" => "application/json"
    ]
];

// 4. Call Google API
$ch = curl_init($apiUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // Fix for local XAMPP/WAMP SSL issues


$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode !== 200) {
    echo json_encode(['error' => 'Gemini API Error', 'details' => $response]);
    exit;
}

// 5. Parse & Return
$geminiData = json_decode($response, true);
$rawText = $geminiData['candidates'][0]['content']['parts'][0]['text'] ?? '{}';

// Clean up code blocks if Gemini adds them (despite instructions)
$rawText = str_replace(['```json', '```'], '', $rawText);
$parsedAction = json_decode($rawText, true);

echo json_encode(['success' => true, 'data' => $parsedAction, 'raw' => $rawText]);

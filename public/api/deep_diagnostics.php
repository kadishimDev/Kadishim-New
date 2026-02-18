<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");

// Configuration
$dataDir = __DIR__ . '/../data';
$uploadsDir = __DIR__ . '/../uploads';
$memorialsFile = $dataDir . '/memorials_v2.json';
$pagesFile = $dataDir . '/pages_db.json';

$report = [
    'timestamp' => date('c'),
    'status' => 'ok', // optimistic
    'score' => 100,
    'checks' => []
];

function addCheck($key, $label, $status, $value = null, $meta = [])
{
    global $report;
    $report['checks'][$key] = [
        'label' => $label,
        'status' => $status, // 'ok', 'warn', 'error'
        'value' => $value,
        'meta' => $meta
    ];
    if ($status === 'error')
        $report['score'] -= 20;
    if ($status === 'warn')
        $report['score'] -= 5;
}

// 1. PHP Environment
addCheck('php_version', 'PHP Version', 'ok', phpversion());
$extensions = get_loaded_extensions();
$requiredExt = ['json', 'mbstring', 'gd'];
$missingExt = array_diff($requiredExt, $extensions);
if (count($missingExt) > 0) {
    addCheck('php_ext', 'PHP Extensions', 'error', 'Missing: ' . implode(', ', $missingExt));
} else {
    addCheck('php_ext', 'PHP Extensions', 'ok', 'All Critical Loaded');
}

// 2. Disk Space
$totalSpace = @disk_total_space(__DIR__);
$freeSpace = @disk_free_space(__DIR__);
if ($totalSpace !== false && $freeSpace !== false) {
    $freePercent = ($freeSpace / $totalSpace) * 100;
    $status = $freePercent < 10 ? 'error' : ($freePercent < 20 ? 'warn' : 'ok');
    addCheck('disk_space', 'Server Disk Space', $status, round($freePercent, 1) . '% Free', [
        'free_gb' => round($freeSpace / 1024 / 1024 / 1024, 2),
        'total_gb' => round($totalSpace / 1024 / 1024 / 1024, 2)
    ]);
} else {
    addCheck('disk_space', 'Server Disk Space', 'warn', 'Unknown');
}

// 3. Write Permissions
$dirsToCheck = [
    'data_dir' => $dataDir,
    'uploads_dir' => $uploadsDir
];

foreach ($dirsToCheck as $key => $path) {
    if (!is_dir($path)) {
        addCheck($key, "Directory: $key", 'error', 'Not Found');
        continue;
    }

    if (is_writable($path)) {
        // Try actual write test
        $testFile = $path . '/.probe_test_' . time();
        if (@file_put_contents($testFile, 'test') !== false) {
            @unlink($testFile);
            addCheck($key, "Writable: " . basename($path), 'ok', 'Yes');
        } else {
            addCheck($key, "Writable: " . basename($path), 'error', 'Failed Write Test');
        }
    } else {
        addCheck($key, "Writable: " . basename($path), 'error', 'No Permission');
    }
}

// 4. Data Integrity (JSON Parse)
if (file_exists($memorialsFile)) {
    $json = file_get_contents($memorialsFile);
    $data = json_decode($json, true);
    if (json_last_error() === JSON_ERROR_NONE) {
        addCheck('memorials_db', 'DB Integrity (Memorials)', 'ok', count($data) . ' Records');
    } else {
        addCheck('memorials_db', 'DB Integrity (Memorials)', 'error', 'Corrupt JSON: ' . json_last_error_msg());
    }
} else {
    addCheck('memorials_db', 'DB Integrity (Memorials)', 'error', 'File Missing');
}

// 5. Email Service
$mailAvailable = function_exists('mail');
addCheck('email_service', 'Email Function', $mailAvailable ? 'ok' : 'error', $mailAvailable ? 'Available' : 'Disabled');

// 6. Server Load (Linux only usually)
if (function_exists('sys_getloadavg')) {
    $load = sys_getloadavg();
    if ($load) {
        addCheck('server_load', 'Server Load', ($load[0] > 0.8) ? 'warn' : 'ok', $load[0] . ' (1min)');
    }
}

// Final Score Calculation
$report['score'] = max(0, $report['score']);
if ($report['score'] < 50)
    $report['status'] = 'critical';
elseif ($report['score'] < 80)
    $report['status'] = 'warning';

echo json_encode($report, JSON_PRETTY_PRINT);

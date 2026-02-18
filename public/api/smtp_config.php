<?php
// SMTP Configuration for Kadishim
// PLEASE UPDATE THIS FILE WITH YOUR REAL CREDENTIALS (PASSED IN CHAT)

return [
    'accounts' => [
        'service' => [
            'host' => 'smtp.inbox.co.il',
            'username' => 'service@kadishim.co.il',
            'password' => 'KadishimService1234@', // Provided by user
            'port' => 587,
            'secure' => 'tls',
            'from_email' => 'service@kadishim.co.il',
            'from_name' => 'שירות לקוחות - קדישים',
        ],
        'contact' => [
            'host' => 'smtp.inbox.co.il',
            'username' => 'contact@kadishim.co.il',
            'password' => 'KadishimContact1234@', // Provided by user
            'port' => 587,
            'secure' => 'tls',
            'from_email' => 'contact@kadishim.co.il',
            'from_name' => 'יצירת קשר - קדישים',
        ],
        'request' => [
            'host' => 'smtp.inbox.co.il',
            'username' => 'reqeuest@kadishim.co.il', // Note: Typo 'reqeuest' as provided by user
            'password' => 'KadishimReqeuest1234@', // Provided by user
            'port' => 587,
            'secure' => 'tls',
            'from_email' => 'reqeuest@kadishim.co.il',
            'from_name' => 'בקשות קדיש',
        ]
    ],
    'debug' => 0 // 0 for off, 2 for verbose debug output
];

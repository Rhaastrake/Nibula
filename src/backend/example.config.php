<?php
declare(strict_types=1);

return [
    // Default key for protected endpoints that don't have a specific key in CUSTOM_ENDPOINT_KEYS
    'GENERAL_API_KEY' => 'DEFAULT_KEY',

    // If you want restrict access to protected endpoints to specific clients, you can define custom keys for each endpoint
    // For subfolder endpoints, use the relative path ('subfolder/endpoint')
    'CUSTOM_ENDPOINT_KEYS' => [
        'subfolder/example-protected'    => 'custom-key',
    ],

    'GENERAL_ALLOWED_ORIGINS' => [
        '*',
        // 'https://example.com',
    ],

    'CUSTOM_ENDPOINT_ORIGINS' => [
        'subfolder/example-protected'    => ['https://app.example.com'],
    ],

    // Database configuration
    'DB_HOST' => '127.0.0.1',
    'DB_NAME' => 'example_db',
    'DB_USER' => 'root',
    'DB_PASS' => '',
];
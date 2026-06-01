<?php
declare(strict_types=1);

return [
    // Default key for protected endpoints that don't have a specific key in ENDPOINT_KEYS
    'API_KEY' => 'DEFAULT_KEY',

    // If you want restrict access to protected endpoints to specific clients, you can define custom keys for each endpoint
    // For subfolder endpoints, use the relative path ('subfolder/endpoint')
    'ENDPOINT_KEYS' => [
    'subfolder/example-protected'    => 'custom-key',
    ],

    // Database configuration
    'DB_HOST' => '127.0.0.1',
    'DB_NAME' => 'example_db',
    'DB_USER' => 'root',
    'DB_PASS' => '',
];
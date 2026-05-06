<?php
declare(strict_types=1);

// Impedisce l'accesso diretto via URL
if (!defined('CORE_ACCESS')) {
    http_response_code(403);
    die('Accesso diretto non consentito.');
}

return [
    // Configurazioni di base
    'API_KEY'              => 'TOKEN',
    'CORS_ALLOWED_ORIGINS' => '*',

    // Configurazioni per l'invio delle Email
    'MAIL_HOST'            => 'smtp.gmail.com',
    'MAIL_PORT'            => 587, // Per i numeri puoi omettere gli apici
    'MAIL_USERNAME'        => 'YOUR_EMAIL',
    'MAIL_PASSWORD'        => 'APP_PASSWORD',
    'MAIL_TO_ADDRESS'      => 'EMAIL_TO_ADDRESS',
];
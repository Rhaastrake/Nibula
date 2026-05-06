<?php
declare(strict_types=1);

if (!defined('CORE_ACCESS')) {
    $errorPage = $_SERVER['DOCUMENT_ROOT'] . '/404.html';
    http_response_code(404);
    if (file_exists($errorPage)) {
        header('Content-Type: text/html; charset=UTF-8');
        echo file_get_contents($errorPage);
    } else {
        echo "404 Not Found";
    }
    exit;
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
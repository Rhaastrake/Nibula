<?php

declare(strict_types=1);

if (!defined('CORE_ACCESS')) {
    http_response_code(403);
    die('Accesso diretto non consentito.');
}

require_once __DIR__ . '/vendor/autoload.php';
require_once __DIR__ . '/modules/Response.php';

// --- GESTORE GLOBALE ERRORI E ECCEZIONI ---
// Trasforma ogni errore PHP in una risposta JSON pulita
set_exception_handler(function ($exception) {
    Response::error(
        $exception->getMessage(),
        500,
        ['file' => $exception->getFile(), 'line' => $exception->getLine()]
    );
});

set_error_handler(function ($severity, $message, $file, $line) {
    if (!(error_reporting() & $severity)) return;
    throw new ErrorException($message, 0, $severity, $file, $line);
});

// --- CARICAMENTO DOTENV ---
// dirname(__DIR__, 2) sale di un livello (da api/ a Berna-Stencil-out/)
try {
    $dotenv = Dotenv\Dotenv::createImmutable(dirname(__DIR__, 2));
    $dotenv->load();
} catch (Exception $e) {
    Response::error("Impossibile caricare il file .env. Assicurati che esista nella root e si chiami esattamente .env", 500);
}

$dotenv->required([
    'API_KEY',
    'CORS_ALLOWED_ORIGINS',
]);

if (($_ENV['APP_ENV'] ?? 'production') === 'production') {
    ini_set('display_errors', '0');
    error_reporting(0);
} else {
    ini_set('display_errors', '1');
    error_reporting(E_ALL);
}
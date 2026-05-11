<?php

declare(strict_types=1);

require_once __DIR__ . '/vendor/autoload.php';
require_once __DIR__ . '/modules/Response.php';

// --- GESTORE GLOBALE ERRORI E ECCEZIONI ---
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

// --- CARICAMENTO CONFIGURAZIONE ---
// dirname(__DIR__) punta alla cartella /api/ dove ora si trova config.php
$config = require dirname(__DIR__) . '/config.php';

// --- CONFIGURAZIONE AMBIENTE ---
if (($config['APP_ENV'] ?? 'production') === 'production') {
    ini_set('display_errors', '0');
    error_reporting(0);
} else {
    ini_set('display_errors', '1');
    error_reporting(E_ALL);
}
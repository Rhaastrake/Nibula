<?php

declare(strict_types=1);

/**
 * Caricamento delle dipendenze e configurazione iniziale.
 */
require_once __DIR__ . '/init.php';
require_once __DIR__ . '/modules/Response.php';

// =====================================================
// 1. ANALISI DELLA RICHIESTA (REQUEST PARSING)
// =====================================================

$method = $_SERVER['REQUEST_METHOD'];
$uri    = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Pulizia URI: rimuoviamo /api e eventuali slash finali
$uri    = rtrim(preg_replace('#^/api#', '', $uri), '/') ?: '/';
$parts  = array_values(array_filter(explode('/', $uri)));

$resource = $parts[0] ?? null;

// =====================================================
// 2. RISOLUZIONE ENDPOINT (ROUTING)
// =====================================================

$publicPath    = __DIR__ . '/endpoints/public/'    . $resource . '.php';
$protectedPath = __DIR__ . '/endpoints/protected/' . $resource . '.php';

$isPublic    = $resource !== null && file_exists($publicPath);
$isProtected = $resource !== null && file_exists($protectedPath);

/**
 * SE L'ENDPOINT NON ESISTE (RITORNO HTML 404)
 */
if (!$isPublic && !$isProtected) {
    http_response_code(404);
    
    // Cerchiamo il file 404.html generato da Eleventy nella root di Laragon
    $errorPage = $_SERVER['DOCUMENT_ROOT'] . '/404.html';
    
    if (file_exists($errorPage)) {
        header('Content-Type: text/html; charset=UTF-8');
        echo file_get_contents($errorPage);
    } else {
        echo "<h1>404 Not Found</h1>";
        echo "The requested URL was not found on this server.";
    }
    exit;
}

// =====================================================
// 3. HEADERS E CORS (Solo se l'endpoint esiste)
// =====================================================

header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Api-Key');

$allowedOrigins = array_filter(array_map('trim', explode(',', $_ENV['CORS_ALLOWED_ORIGINS'] ?? '')));
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (in_array($origin, $allowedOrigins, true) || in_array('*', $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: $origin");
} else {
    header("Access-Control-Allow-Origin: " . ($allowedOrigins[0] ?? ''));
}

if ($method === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// =====================================================
// 4. GUARDIA DI AUTENTICAZIONE
// =====================================================

if ($isProtected) {
    $apiKey   = $_SERVER['HTTP_X_API_KEY'] ?? '';
    $validKey = $_ENV['API_KEY'] ?? '';

    if ($validKey === '' || $apiKey !== $validKey) {
        Response::error('Unauthorized', 401);
    }
}

// =====================================================
// 5. ESECUZIONE (DISPATCH)
// =====================================================

$requestParams = array_slice($parts, 1);

// Carica il file dell'endpoint richiesto
require $isProtected ? $protectedPath : $publicPath;
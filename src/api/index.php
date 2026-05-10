<?php

declare(strict_types=1);

define('CORE_ACCESS', true);

/**
 * Caricamento delle dipendenze e configurazione iniziale.
 */
require_once __DIR__ . '/core/init.php';
require_once __DIR__ . '/core/modules/Response.php';

// =====================================================
// 1. ANALISI DELLA RICHIESTA (REQUEST PARSING)
// =====================================================

$method = $_SERVER['REQUEST_METHOD'];
$uri    = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

$uri    = rtrim(preg_replace('#^/api#', '', $uri), '/') ?: '/';
$parts  = array_values(array_filter(explode('/', $uri)));

// =====================================================
// 2. RISOLUZIONE ENDPOINT (ROUTING CON SOTTOCARTELLE)
// =====================================================

$basePublic    = __DIR__ . '/endpoints/public/';
$baseProtected = __DIR__ . '/endpoints/protected/';

$endpointFile  = null;
$isProtected   = false;
$requestParams = [];

// Variabili temporanee per il ciclo di ricerca
$checkParts = $parts;
$params     = [];

/**
 * Logica di routing dinamico: cerca il match più profondo.
 */
while (count($checkParts) > 0) {
    $relativePath = implode('/', $checkParts) . '.php';

    // Controlla prima se è una route pubblica
    if (file_exists($basePublic . $relativePath)) {
        $endpointFile = $basePublic . $relativePath;
        $isProtected  = false;
        break;
    }

    // Poi controlla se è una route protetta
    if (file_exists($baseProtected . $relativePath)) {
        $endpointFile = $baseProtected . $relativePath;
        $isProtected  = true;
        break;
    }

    // Se non ha trovato il file, l'ultimo pezzo dell'URL diventa un parametro
    array_unshift($params, array_pop($checkParts));
}

/**
 * SE L'ENDPOINT NON ESISTE (RITORNO HTML 404)
 */
if (!$endpointFile) {
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

$allowedOrigins = array_filter(array_map('trim', explode(',', $config['CORS_ALLOWED_ORIGINS'] ?? '')));
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
    $validKey = $config['API_KEY'] ?? '';

    if ($validKey === '' || $apiKey !== $validKey) {
        Response::error('Unauthorized. X_API_KEY is incorrect or missing', 401);
    }
}

// =====================================================
// 5. ESECUZIONE (DISPATCH)
// =====================================================

// I parametri sono i segmenti residui dell'URL non usati per trovare il file PHP
$requestParams = $params;

// Carica il file dell'endpoint trovato
require $endpointFile;
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

require_once __DIR__ . '/../../core/modules/Response.php';

if ($method !== 'GET') {
    Response::error('Method not allowed', 405);
}

Response::success([
    'message'     => 'Public endpoint is working',
    'endpoint'    => 'example-public-endpoint',
    'visibility'  => 'public',
    'params'      => $requestParams,
]);
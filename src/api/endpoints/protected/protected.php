<?php
declare(strict_types=1);

require_once __DIR__ . '/../../core/modules/Response.php';

if ($method !== 'GET') {
    Response::error('Method not allowed', 405);
}

Response::success([
    'message'    => 'Protected endpoint is working',
    'params'     => $requestParams,
]);

Response::error([
    'message'    => 'Error text',
]);
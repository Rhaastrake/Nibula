<?php

declare(strict_types=1);

require_once __DIR__ . '/../../modules/Response.php';

if ($method !== 'GET') {
    Response::error('Method not allowed', 405);
}

Response::success([
    'message'     => 'Public endpoint is working',
    'endpoint'    => 'ping',
    'visibility'  => 'public',
    'params'      => $requestParams,
]);
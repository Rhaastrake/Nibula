<?php
declare(strict_types=1);

require_once CORE_PATH . '/modules/Response.php';
require_once __DIR__ . '/../../../database/models/User.php';

if ($method !== 'POST') {
    Response::error('Method not allowed', 405);
}

//
// Your protected endpoint logic here. You can access route parameters in $requestParams array
//

$input = json_decode(file_get_contents('php://input'), true) ?? [];

$email    = trim(filter_var($input['email'] ?? '', FILTER_SANITIZE_EMAIL));
$password = trim($input['password'] ?? '');

if (empty($email) || empty($password)) {
    Response::error('Missing fields', 400);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    Response::error('Invalid email', 400);
}

$user  = new User();
$found = $user->findByEmail($email);

if (!$found || !password_verify($password, $found['password'])) {
    Response::error('Invalid credentials', 401);
}

unset($found['password']);
Response::success([
    'user'    => $found,
]);
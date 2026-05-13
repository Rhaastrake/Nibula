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

$nickname = htmlspecialchars(strip_tags(trim($input['nickname'] ?? '')));
$email    = trim(filter_var($input['email'] ?? '', FILTER_SANITIZE_EMAIL));
$password = trim($input['password'] ?? '');

if (empty($nickname) || empty($email) || empty($password)) {
    Response::error('Missing fields', 400);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    Response::error('Invalid email', 400);
}

if (strlen($password) < 8) {
    Response::error('Password must be at least 8 characters', 400);
}

try {
    $user  = new User();
    $newId = $user->create($nickname, $email, $password);
    http_response_code(201);
    Response::success(['id' => $newId]);
} catch (PDOException $e) {
    if ($e->getCode() === '23000') {
        Response::error('Nickname or email already exists', 409);
    }
    Response::error('Database error', 500);
}
<?php
declare(strict_types=1);


// 2. Richiamo il tuo modulo Response e il Modello
require_once CORE_PATH . '/modules/Response.php';
require_once __DIR__ . '/../../database/models/User.php';

//
// Your protected endpoint logic here. You can access route parameters in $requestParams array
//

$user = new User();
$id = isset($requestParams[0]) ? (int)$requestParams[0] : null;
$input = json_decode(file_get_contents('php://input'), true) ?? [];

try {
    switch ($method) {
        case 'GET':
            $data = $id ? $user->getById($id) : $user->getAll();
            if ($id && !$data) {
                Response::error('User not found', 404);
            }
            // Sostituito con Response::success()
            Response::success($data);
            break;

        case 'POST':
            if (empty($input['nickname']) || empty($input['email'])) {
                Response::error('Missing fields', 400);
            }
            if (!filter_var($input['email'], FILTER_VALIDATE_EMAIL)) {
                Response::error('Invalid email', 400);
            }
            
            $newId = $user->create($input['nickname'], $input['email']);
            http_response_code(201);
            Response::success(['message' => 'Created', 'id' => $newId]);
            break;

        case 'PUT':
        case 'PATCH':
            if (!$id) Response::error('ID required', 400);
            if (!$user->update($id, $input)) {
                Response::error('Not found or no changes', 404);
            }
            Response::success(['message' => 'Updated']);
            break;

        case 'DELETE':
            if (!$id) Response::error('ID required', 400);
            if (!$user->delete($id)) {
                Response::error('Not found', 404);
            }
            Response::success(['message' => 'Deleted']);
            break;

        default:
            Response::error('Method not allowed', 405);
            break;
    }
} catch (PDOException $e) {
    if ($e->getCode() === '23000') {
        Response::error('Nickname or email already exists', 409);
    }
    Response::error('Database error', 500);
}
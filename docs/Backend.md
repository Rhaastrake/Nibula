# Backend

The backend is a PHP REST API located in `src/backend/`, copied to the output directory automatically at build time.

## Structure

```
src/backend/
├── api/
│   ├── public/       # Endpoints accessible without an API key
│   └── protected/    # Endpoints requiring X-Api-Key header
├── database/
│   ├── Database.php
│   ├── models/
│   └── migrations/
├── config.php        # Your local config — never commit this
└── config.example.php
```

## Configuration

`config.php` works like a `.env` file — it holds secrets and environment settings that stay local and out of version control.

Copy `config.example.php` to `config.php` and fill in your values:

### config.php <small>(`src/backend/`)</small>
```php
return [
    'APP_ENV' => 'development', // or 'production'
    'API_KEY' => 'your-default-key',

    'ENDPOINT_KEYS' => [
        'subfolder/example-protected' => 'specific-key',
    ],

    'DB_HOST' => '127.0.0.1',
    'DB_NAME' => 'example_db',
    'DB_USER' => 'root',
    'DB_PASS' => '',
];
```

`API_KEY` is the fallback key for all protected endpoints. Use `ENDPOINT_KEYS` to assign a different key to a specific endpoint — for subfolder endpoints, use the relative path as the key.

## How routing works

The file path inside `api/` maps directly to the URL. Extra URL segments become route parameters available as `$requestParams[]`.

Every endpoint file has access to:

| Variable | Description |
|---|---|
| `$method` | HTTP method (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`) |
| `$requestParams` | Extra URL segments (e.g. `/api/posts/42` → `['42']`) |

## Creating a public endpoint

Create a `.php` file anywhere inside `api/public/`

### api/public/posts.php
```php
<?php
declare(strict_types=1);

require_once CORE_PATH . '/modules/Response.php';

if ($method !== 'GET') {
    Response::error('Method not allowed', 405);
}

$id = isset($requestParams[0]) ? (int)$requestParams[0] : null;

Response::success(['id' => $id]);
```

Reachable at `/api/posts` or `/api/posts/42`

## Creating a protected endpoint

Create a `.php` file inside `api/protected/`. The API key check happens automatically before your file runs.

### api/protected/admin/stats.php
```php
<?php
declare(strict_types=1);

require_once CORE_PATH . '/modules/Response.php';

if ($method !== 'GET') {
    Response::error('Method not allowed', 405);
}

Response::success(['visits' => 1024]);
```

To assign a dedicated key, add it to `config.php`:

```php
'ENDPOINT_KEYS' => [
    'admin/stats' => 'secret-stats-key',
],
```

## The Response helper

```php
Response::success($data, $code);            // default 200
Response::error($message, $code, $details); // default 400
Response::noContent();                      // 204
```

## Handling multiple methods

```php
$id    = isset($requestParams[0]) ? (int)$requestParams[0] : null;
$input = json_decode(file_get_contents('php://input'), true) ?? [];

switch ($method) {
    case 'GET':
        Response::success(['id' => $id]);
        break;

    case 'POST':
        if (empty($input['title'])) Response::error('Missing title', 400);
        Response::success(['message' => 'Created'], 201);
        break;

    case 'DELETE':
        if (!$id) Response::error('ID required', 400);
        Response::success(['message' => 'Deleted']);
        break;

    default:
        Response::error('Method not allowed', 405);
}
```

## Using the database

### database/models/Post.php
```php
<?php
declare(strict_types=1);

require_once __DIR__ . '/../Database.php';

class Post {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    public function getAll(): array {
        return $this->db->query("SELECT * FROM posts")->fetchAll();
    }

    public function getById(int $id): ?array {
        $stmt = $this->db->prepare("SELECT * FROM posts WHERE id = :id");
        $stmt->execute(['id' => $id]);
        return $stmt->fetch() ?: null;
    }

    public function create(string $title): int {
        $stmt = $this->db->prepare("INSERT INTO posts (title) VALUES (:title)");
        $stmt->execute(['title' => htmlspecialchars(strip_tags(trim($title)))]);
        return (int)$this->db->lastInsertId();
    }
}
```

Then use it inside an endpoint:

```php
require_once __DIR__ . '/../../database/models/Post.php';

$post = new Post();
Response::success($post->getAll());
```

Migrations live in `database/migrations/` as plain SQL files — run them manually against your database.

## Calling endpoints from the frontend

```js
// Public
const res = await fetch('/api/posts/42');

// Protected
const res = await fetch('/api/admin/stats', {
    headers: { 'X-Api-Key': 'secret-stats-key' }
});

// POST
const res = await fetch('/api/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Api-Key': 'your-key' },
    body: JSON.stringify({ title: 'Hello world' })
});
```

## Pre-built endpoints

| Route | Auth | Methods | Description |
|---|---|---|---|
| `/api/example-public` | No | `GET` | Smoke test for public routing |
| `/api/subfolder/example-protected` | Yes | `GET` | Smoke test for protected routing |
| `/api/auth/register` | No | `POST` | Register a new user |
| `/api/auth/login` | No | `POST` | Login and retrieve user data |
| `/api/auth-system` | Yes | `GET POST PUT PATCH DELETE` | Full CRUD on users |
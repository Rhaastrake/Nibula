# Backend

> **PHP requirement** — the backend runs only on servers with PHP support:
> - **Apache** (shared hosting, VPS) ✅
> - **Nginx** + PHP-FPM (VPS) ✅
> - **IIS** + FastCGI (Windows Server) ✅
> - **Static hosting** (Netlify, Vercel, GitHub Pages, Cloudflare Pages) ❌

The backend is a PHP REST API located in `src/backend/`, copied to the output directory automatically at build time.

## Structure

```
src/backend/
├── api/
│   ├── public/       # Endpoints accessible without an API key
│   └── protected/    # Endpoints requiring X-Api-Key header
├── db/
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
    // Default key for protected endpoints that don't have a specific key in ENDPOINT_KEYS
    'API_KEY' => 'default-key',

    // If you want restrict access to protected endpoints to specific clients, you can define custom keys for each endpoint
    'ENDPOINT_KEYS' => [
    // For subfolder endpoints, use the relative path ('subfolder/endpoint')
    // 'subfolder/endpoint'    => 'example-key',
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

### api/public/example.php
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

## Creating a protected endpoint

Create a `.php` file inside `api/protected/`. The API key check happens automatically before your file runs.

### api/protected/example.php
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
    'endpoint' => 'custom-key',
],
```

## The Response helper

```php
Response::success($data, $code);            // default 200
Response::error($message, $code, $details); // default 400
Response::noContent();                      // 204
```

## Pre-built endpoints

| Route | Method | Description |
|---|---|---|
| `/api/example-public` | `GET` | Example endpoint that doesn't require any key |
| `/api/example-protected` | `GET` | Example endpoint that requires X-API-KEY |
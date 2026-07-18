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
│   └── protected/    # Endpoints requiring X-Api-Key header
│   ├── public/       # Endpoints accessible without an API key
├── _core/            # Framework internals (routing, modules) — do not edit
│   └── modules/      # Response, RateLimiter, ...
├── database/
│   ├── Database.php
│   └── migrations/
├── example.config.php   # Template — versioned, safe to commit
└── config.php           # Your local config, generated on setup — never commit this
```

> A scaffolded project contains **both** files. `config.php` is generated automatically by `bs new` (a copy of the example) and is git-ignored, so your secrets stay local and are never pushed. `example.config.php` is kept and versioned: it's the file that ends up on GitHub, acting as a secret-free reference so anyone cloning the project knows which keys to set. If `config.php` is ever missing (e.g. after a fresh clone), just copy `example.config.php` to `config.php`.

> Note: in the boilerplate repo itself, only `example.config.php` exists — `config.php` is created at scaffold time, not shipped.

## Configuration

`config.php` works like a `.env` file — it holds secrets and environment settings that stay local and out of version control.

Fill in your values:

### config.php <small>(`src/backend/`)</small>
```php
// Default key for protected endpoints that don't have a specific key in CUSTOM_ENDPOINT_KEYS
'GENERAL_API_KEY' => 'DEFAULT_KEY',

// If you want restrict access to protected endpoints to specific clients, you can define custom keys for each endpoint
// For subfolder endpoints, use the relative path ('subfolder/endpoint')
'CUSTOM_ENDPOINT_KEYS' => [
    'subfolder/endpoint'    => 'custom-key',
],

'GENERAL_ALLOWED_ORIGINS' => [
    '*',
    // 'https://example.com',
],

'CUSTOM_ENDPOINT_ORIGINS' => [
    'subfolder/endpoint'    => ['https://app.example.com'],
],

// Database configuration
'DB_HOST' => '127.0.0.1',
'DB_NAME' => 'example_db',
'DB_USER' => 'root',
'DB_PASS' => '',
```

### API keys

`GENERAL_API_KEY` is the fallback key for all protected endpoints. Use `CUSTOM_ENDPOINT_KEYS` to assign a different key to a specific endpoint — for subfolder endpoints, use the relative path as the key.

> ⚠️ The API key travels in the `X-Api-Key` header on every request. Use it only for server-to-server calls over HTTPS. Never embed it in frontend code, where it would be publicly visible.

### CORS (allowed origins)

Cross-origin access mirrors the API-key model:

- `GENERAL_ALLOWED_ORIGINS` — the default list of origins allowed to call any endpoint from a browser.
- `CUSTOM_ENDPOINT_ORIGINS` — overrides the default for a specific endpoint, keyed by the same relative path used in `CUSTOM_ENDPOINT_KEYS`.

Origins must be exact (scheme + host, no trailing slash), e.g. `https://example.com`. When a request's `Origin` is in the resolved list, it is reflected back in `Access-Control-Allow-Origin` (with `Vary: Origin`). An empty list sends no CORS header — the most restrictive setting; same-origin requests still work. Use `'*'` as the only element to allow any origin (not recommended for protected endpoints).

Resolution order for a given endpoint: `CUSTOM_ENDPOINT_ORIGINS[path]` if present, otherwise `GENERAL_ALLOWED_ORIGINS`.

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
'CUSTOM_ENDPOINT_KEYS' => [
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
| `/api/public/example-public` | `GET` | Example endpoint that doesn't require any key |
| `/api/protected/example-protected` | `GET` | Example endpoint that requires X-API-KEY |

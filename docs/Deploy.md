# Server Configuration

Berna-Stencil includes ready-made server configuration for Apache and IIS. For Nginx, a reference config is provided in the project root.

## Apache

`.htaccess` files at `src/frontend/` and `src/backend/` are automatically copied to the build output by Eleventy. No additional setup required.

Covers:
- Directory listing disabled
- 403 / 404 → `/404.html`
- Sensitive files blocked (`web.config`, dotfiles, etc.)
- `/api/*` → `backend/_core/index.php`
- HTTPS redirect

## IIS

`web.config` files at `src/frontend/` and `src/backend/` are automatically copied to the build output by Eleventy. No additional setup required.

Covers the same rules as the Apache configuration above.

## Nginx

Nginx does not support per-directory configuration files. The `nginx.conf` in the project root is a reference config that must be manually placed on the server.

### Setup

1. Copy `nginx.conf` to the server:
```bash
scp nginx.conf user@server:/etc/nginx/sites-available/your-site
```

2. Edit `server_name` and `root` to match your environment:
```nginx
server_name example.com;
root /var/www/html/out;
```

3. Add your SSL certificate paths.

4. Enable and reload:
```bash
ln -s /etc/nginx/sites-available/your-site /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
```

### PHP-FPM socket

The default socket path in `nginx.conf` targets RHEL / Fedora systems. Adjust for your distro:

| Distro | Path |
|---|---|
| RHEL / Fedora | `unix:/run/php-fpm/php-fpm.sock` |
| Debian / Ubuntu | `unix:/run/php/php-fpm.sock` |
| TCP fallback | `127.0.0.1:9000` |
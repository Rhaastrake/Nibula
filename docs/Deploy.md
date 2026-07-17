# Server Configuration

Berna-Stencil builds a static site into your output folder (`out`). To put it
online you upload that folder to a web server. Which server config you need
depends on **where** you publish.

## Where to publish

### Shared hosting (Apache — e.g. Aruba, most cPanel providers)

The most common and beginner-friendly option. You rent space on a server that's
already set up, and you just upload your files.

In short: take the **contents of the `out` folder** and upload them to the
hosting's public web root (often called `htdocs`, `public_html`, or `www`).
That's it — the site is live.

On this kind of hosting the server usually runs **Apache** (or **IIS** on Windows
hosts). This is where `.htaccess` (Apache) or `web.config` (IIS) come in: they're
already inside your `out` folder and get picked up automatically, with no extra
setup. They handle security and routing for you (see below).

> You don't need to understand the details to publish — upload `out`, and the
> config files do their job. The sections below explain what they protect.

### Your own server (Nginx — e.g. an Ubuntu VPS)

If you rent a bare server (a VPS) and install everything yourself, it typically
runs **Nginx** on **Ubuntu Server**. Here nothing is pre-configured: you set up
Nginx, PHP, and the security rules by hand. This is more powerful but requires
knowing what you're doing — if this is your path, read up on Nginx server
administration first. The Nginx section below gives you the essential rules to
start from.

---

## Apache (`.htaccess`)

`.htaccess` files at `src/frontend/` and `src/backend/` are automatically copied
into the build output by Eleventy. No setup required — upload `out` and Apache
reads them on its own.

They cover:
- Directory listing disabled
- 403 / 404 → `/404.html`
- Sensitive files blocked (`web.config`, dotfiles, etc.)
- Backend source directory sealed — all access funnels through the front controller
- `/api/*` → `backend/_core/index.php`
- HTTPS redirect

This is the config that makes shared hosting like Aruba work out of the box.

## IIS (`web.config`)

For Windows-based hosting. `web.config` files at `src/frontend/` and
`src/backend/` are automatically copied into the build output by Eleventy, and
IIS reads them automatically — same idea as `.htaccess`, different server.

Covers the same rules as the Apache configuration above.

## Nginx

Used when you run your **own Ubuntu Server** (a VPS). Unlike Apache and IIS,
Nginx does **not** read per-directory config files, so there's nothing automatic
here.

**`nginx.conf` in the project root is not a ready-to-use file.** It is a set of
directives that you must take and adapt into a complete Nginx `server { }`
block — the one that defines your domain (`server_name`), ports (`listen`), and
SSL certificates. Paste these rules inside your own server block and adjust
`root` to point to your `out` folder.

These directives are the **minimum Nginx equivalent of `.htaccess` and
`web.config`**: their job is to not expose dangerous files (server config files,
the backend source directory) and to route the API correctly. Without them, an
Nginx server would serve your site but leave those files reachable.

They provide:
- `server_tokens off` — hides the Nginx version
- `autoindex off` — disables directory listing
- 403 / 404 → `/404.html`
- Backend source directory (`/backend/`) sealed with `return 404`
- Server config files (`.htaccess`, `web.config`) blocked anywhere in the tree
- `/api/*` routed to the PHP front controller
- Security headers on static responses

> Setting up Nginx correctly (SSL, HTTPS redirect, PHP-FPM) goes beyond these
> rules. If you plan to publish with Nginx, read up on Nginx + PHP-FPM on Ubuntu
> Server first — these directives are the security starting point, not a full
> server setup.

### PHP-FPM socket

The socket path in the `/api/` rule targets RHEL / Fedora by default. On Ubuntu
the socket name includes the PHP version — check with `ls /run/php/` and adjust:

| Distro | Path |
|---|---|
| RHEL / Fedora | `unix:/run/php-fpm/php-fpm.sock` |
| Debian / Ubuntu | `unix:/run/php/php8.3-fpm.sock` |
| TCP fallback | `127.0.0.1:9000` |
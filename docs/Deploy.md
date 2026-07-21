# Server Configuration

Nibula builds a static site into your output folder (`out`). To put it online you
upload that folder to a web server. Which server config you need depends on
**where** you publish and **which backend** you chose at scaffold time (PHP or
Node.js — see `docs/Backend.md`).

The shipped `.htaccess`, `web.config` and `nginx.conf` are written to cover
**both** backends, so you don't swap config files based on your choice. There is
one caveat on Apache/IIS, explained at the end.

## Prerequisites

**PHP backend:** a server with PHP support (Apache, Nginx + PHP-FPM, or IIS +
FastCGI) and Composer for the backend dependencies. Works on typical shared
hosting.

**Node backend:** Node.js 18+ on the server and the ability to run a
long-running process — i.e. a VPS you control, not typical shared hosting. No PHP
or Composer required.

## Where to publish

### Shared hosting (Apache — e.g. Aruba, most cPanel providers)

The most common and beginner-friendly option, and the natural home for the
**PHP** backend (shared hosting can't keep a Node process alive). You rent space
on a server that's already set up and just upload your files.

Take the **contents of the `out` folder** and upload them to the hosting's public
web root (often `htdocs`, `public_html`, or `www`). That's it — the site is live.
`.htaccess` (Apache) or `web.config` (IIS) are already inside `out` and get picked
up automatically, handling security and routing for you.

### Your own server (Nginx — e.g. an Ubuntu VPS)

If you rent a bare server (a VPS) and install everything yourself, it typically
runs **Nginx** on **Ubuntu Server**. Here nothing is pre-configured: you set up
Nginx, the backend, and the security rules by hand. This is the setup for the
**Node** backend (and also works for PHP + PHP-FPM). The Nginx section below
gives you the essential rules to start from.

---

## Apache (`.htaccess`)

`.htaccess` files at `src/frontend/` and `src/backend/` are copied into the build
output by Eleventy. No setup required — upload `out` and Apache reads them.

They cover:
- Directory listing disabled
- 403 / 404 → `/404.html`
- Sensitive files blocked (`web.config`, dotfiles, etc.)
- Backend source directory sealed — all access funnels through the front controller
- `/api/*` routing (see the dual-backend note below)

**Dual backend:** if `mod_proxy` is available, `/api` is reverse-proxied to the
Node backend (`127.0.0.1:3000`); if not (typical shared hosting), `/api` is
rewritten to the PHP front controller. To force PHP on a server that *has*
`mod_proxy`, comment the `mod_proxy` block in `.htaccess`.

## IIS (`web.config`)

For Windows-based hosting. `web.config` files at `src/frontend/` and
`src/backend/` are copied into the build output by Eleventy and read
automatically — same idea as `.htaccess`, different server.

**Dual backend:** the `ApiToNode` rewrite rule (requires the ARR + URL Rewrite
modules) reverse-proxies `/api` to Node and wins if present. To use PHP instead,
remove the `ApiToNode` rule; the `ApiToPhp` fallback then rewrites `/api` to the
PHP front controller.

## Nginx

Used when you run your **own Ubuntu Server** (a VPS). Unlike Apache and IIS, Nginx
does **not** read per-directory config files, so there's nothing automatic here.

**`nginx.conf` in the project root is not a ready-to-use file.** It is a set of
directives you adapt into a complete Nginx `server { }` block — the one that
defines your domain (`server_name`), ports (`listen`), and SSL certificates.
Paste these rules inside your own server block and set `root` to your `out`
folder.

They provide:
- `server_tokens off` — hides the Nginx version
- `autoindex off` — disables directory listing
- 403 / 404 → `/404.html`
- Backend source directory (`/backend/`) sealed with `return 404`
- Server config files (`.htaccess`, `web.config`) blocked anywhere in the tree
- `/api/*` routed to the backend (see below)
- Security headers on static responses

**Dual backend (auto-fallback):** the shipped `nginx.conf` sends `/api` to the
Node backend on `127.0.0.1:3000` and, if Node is unreachable (502/504), falls
back automatically to the PHP front controller. So the same config works whether
you deployed Node or PHP — Nginx is the only server that can do this fallback
automatically.

> Setting up Nginx fully (SSL, HTTPS redirect, PHP-FPM and/or the Node service)
> goes beyond these rules. These directives are the security starting point, not
> a complete server setup.

### PHP-FPM socket

When using the PHP path, the socket in the `/api` fallback targets Debian/Ubuntu
by default. Check with `ls /run/php/` and adjust:

| Distro | Path |
|---|---|
| Debian / Ubuntu | `unix:/run/php/php8.3-fpm.sock` |
| RHEL / Fedora | `unix:/run/php-fpm/php-fpm.sock` |
| TCP fallback | `127.0.0.1:9000` |

---

## Starting the Node backend on the server

Unlike PHP, the Node backend is **not** executed by the web server per request —
it is a process you start and keep alive. After uploading your built `out` folder:

1. Install the backend's runtime deps (only needed if an endpoint uses the DB):
   ```bash
   cd /var/www/your-site/out/backend
   npm install
   ```

2. Make sure `config.js` exists in `out/backend/` (copy `example.config.js` to
   `config.js` if missing) and fill in your values.

3. Start it — quick test first:
   ```bash
   node _core/index.js
   # -> [backend-node] listening on http://127.0.0.1:3000 (env: production)
   ```
   Then, from the server, confirm it answers:
   ```bash
   curl http://127.0.0.1:3000/api/example-public
   ```

   > Running `node _core/index.js` directly ties the process to your SSH session —
   > close the terminal and the backend dies. The recommended way to try it out
   > without staying stuck there is **`screen`** (a detachable terminal):
   > ```bash
   > screen -S backend            # open a named session
   > node _core/index.js          # start the backend inside it
   > # press Ctrl+A then D to detach — the backend keeps running
   > # reattach later with:  screen -r backend
   > ```
   > `screen` is perfect for testing and small setups. For a real production
   > deployment that also restarts on crash/reboot, prefer **systemd** (step 4).

4. To keep it running after logout, use **systemd**. An example unit ships at
   `backend/backend-node.service.example` — copy it to
   `/etc/systemd/system/backend-node.service`, adjust `WorkingDirectory` and the
   `node` path (`which node`), then:
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable --now backend-node
   sudo systemctl status backend-node
   ```
   (`pm2` also works: `pm2 start _core/index.js --name backend-node`.)

The web server then reverse-proxies `/api` to this process; with the shipped
`nginx.conf`, if Node is down Nginx falls back to PHP automatically.

### Environment variables

| Variable | Default | Purpose |
|---|---|---|
| `PORT` | `3000` | Port Node listens on (match your proxy target) |
| `HOST` | `127.0.0.1` | Bind address (keep it local; the web server is the public face) |
| `APP_ENV` | `production` | `production` hides error details; anything else = verbose 500s |
| `DOCUMENT_ROOT` | auto (`out/`) | Where `404.html` lives; auto-detected as the folder above `backend/` |

---

## The one caveat on Apache and IIS

Nginx can health-check the Node upstream and fall back to PHP automatically.
Apache (`.htaccess`) and IIS (`web.config`) **cannot** — a per-directory config
can't know whether Node is up. So there the routing is decided by configuration,
not at runtime:

- **Apache:** `mod_proxy` present → Node; absent → PHP. Comment the `mod_proxy`
  block to force PHP on a proxy-enabled server.
- **IIS:** `ApiToNode` rule present (needs ARR) → Node; remove it to use the
  `ApiToPhp` fallback.

Since a given deployment runs only one backend, this is a one-time setup, not a
per-request concern.
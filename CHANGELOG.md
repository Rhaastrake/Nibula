# Changelog

All notable changes to Nibula are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2026-07-23

### Added
- **Full favicon set**: `favicon.svg`, `favicon-32.png` and `apple-touch-icon.png`
  (180×180, opaque) in `assets/brand/`. iOS home-screen icons no longer fall back
  to a screenshot of the page.

### Changed
- **`data_bs_theme` renamed to `theme`** in `site.json`. It still drives
  `data-bs-theme` on the `<html>` tag; the shorter name keeps the config readable
  and independent from the framework naming.
- **`theme_color` is now a single value** instead of a `light`/`dark` pair. The
  theme is fixed per build, so two per-scheme colors could contradict the
  rendered page.
- **Favicon paths are hardcoded in `base.njk`.** The `favicon` key was removed
  from `site.json`: it only ever covered one of the three tags, which was more
  confusing than helpful. Replace the files in `assets/brand/` instead.
- `_routes/` renamed to `routes/` — it holds entry points, not internals.

### Removed
- **`mdFile` shortcode** and the `markdown-it` dependency.
- **`github-markdown-css`** and its two passthrough copies.

### Migration
- In `site.json`: rename `data_bs_theme` to `theme`, flatten `theme_color` to a
  single string, drop `favicon`.
- Place `favicon.svg`, `favicon-32.png` and `apple-touch-icon.png` in
  `src/frontend/assets/brand/`.
- If you used `{% mdFile %}`, render the Markdown ahead of time or add
  `markdown-it` back to your own project.

## [1.1.0] - 2026-07-21

### Added
- **Node.js backend** as an alternative to PHP, living side by side in
  `src/backend/`: `_core/index.js` front controller (which is also the HTTP
  server), `Response` and `RateLimiter` modules, a `mysql2` pool singleton
  `Database.js`, `example.config.js`, and a `package.json` for the backend's
  own dependencies. Same REST API as PHP: routing, `X-Api-Key` auth, CORS and
  file-based rate limiting are identical.
- **Backend choice at scaffold time**: `nib new` now asks whether to use Node.js
  or PHP, in addition to language and CSS framework.
- `backend/backend-node.service.example` — a ready-to-adapt **systemd** unit for
  keeping the Node backend running on a server.
- `config.js` is generated from `example.config.js` at scaffold time (mirroring
  the existing `config.php` generation).
- Deployment docs now cover running the Node backend with **`screen`** (quick /
  small setups) and **systemd** (production), plus environment variables.

### Changed
- **Composer is now required only when the PHP backend is chosen.** If you pick
  Node, `composer install` is skipped entirely and the backend's npm
  dependencies (`mysql2`) are installed instead.
- `.htaccess`, `web.config` and `nginx.conf` now cover **both** backends. On
  nginx, `/api` goes to Node and automatically falls back to the PHP front
  controller when Node is unreachable. On Apache/IIS the active backend is
  selected by configuration (documented), since per-directory configs can't
  health-check an upstream.
- `.gitignore` now also ignores `src/backend/config.js`,
  `src/backend/node_modules/` and `src/backend/cache/`.
- Documentation (`README.md`, `docs/Backend.md`, `docs/Deploy.md`) updated:
  backend examples now use JavaScript/Node as the reference, with the equivalent
  PHP shown alongside and a note that PHP behaves identically.

### Notes
- Both backends are always scaffolded, so you can switch later without
  re-creating the project. The PHP front controller only serves `.php` endpoint
  files and the Node one only `.js`, so they coexist without conflict.

## [1.0.2]

- Previous release (PHP backend only).

[1.1.0]: https://github.com/Rhaastrake/Nibula/releases/tag/v1.1.0
[1.0.2]: https://github.com/Rhaastrake/Nibula/releases/tag/v1.0.2
# Changelog

All notable changes to Nibula are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.3] - 2026-07-22

### Changed
- **The update check no longer runs on every command.** Previously every
  invocation of `nib` (and the `nbl` / `nibula` aliases) contacted the npm
  registry before doing anything, adding up to 2.5s of latency to `nib run`,
  `nib build`, `nib cli` and `nib clean`. The check now runs only for `nib new`
  and `nib update`; all other commands work entirely offline.
- **`nib new` now completes the update automatically.** When a newer version is
  available and you accept the prompt, Nibula installs it and immediately
  re-runs the scaffolding with the new version, instead of asking you to type
  `nib new <project-name>` a second time.
- **New projects are scaffolded at version `0.0.0`** instead of `1.0.0`, so a
  freshly created site no longer claims a stable public release. Bump it
  yourself as the project grows, and reach `1.0.0` when you go to production.
- **Framework SCSS imports are now short and readable.** The framework modules
  in `src/frontend/scss/modules/frameworks/` used a five-level relative path
  back to `node_modules`; they now import directly by package name, e.g.
  `@import "bootstrap/scss/card";`. This matches what the styling docs already
  showed, and makes commenting modules out far less error-prone.
- `nib help` no longer appends an "a newer version is available" line, since it
  no longer performs the check.

### Added
- Internal `--skip-update-check` flag on `nib new`, set automatically when the
  command is re-run after a self-update. It prevents a loop if the registry is
  slow to propagate the new version.
- `--load-path=node_modules` on the repository's own `build:css` and `serve:css`
  scripts, so the short framework imports resolve. Generated projects already
  carried this flag.

### Fixed
- Repaired the ASCII header boxes and the commented-out example import inside
  `_bootstrap.scss`, `_bulma.scss` and `_foundation.scss`, where an earlier
  find-and-replace had injected the `node_modules` path into comment text and
  broken the alignment.
- `src/frontend/data` is no longer copied to the output folder. It holds the
  Eleventy global data file, which is consumed at build time to render meta
  tags and page config — publishing it produced a dead file in `out/` and
  exposed the full page map, including `noindex` entries. It remains a watch
  target, so edits still trigger a rebuild.

### Notes
- If the updated installation can't be located after `npm install -g` (an
  unusual `npm root -g` setup, for example), Nibula reports the problem and
  asks you to re-run the command, rather than scaffolding silently with the
  old templates.
- Existing projects are unaffected by the version change: it applies only to
  newly created ones.
- Short SCSS imports rely on Sass's `--load-path`, which is passed by the npm
  scripts. Compiling the stylesheets with a different tool (a VS Code Sass
  extension, for instance) will need the same load path configured.

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
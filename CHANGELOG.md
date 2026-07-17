# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.9.0] - 2026-07-17

### Changed
- Simplified the documentation and `nginx.conf` reference for a more concise setup guide.
- Emptied the `welcome` component (the default landing page shown on a fresh project) so new projects start from a clean slate.
- Reordered the commands in the `bs cli` menu.

### Removed
- Dropped the `buttons` and `notification` CSS modules.
- The `docs/` folder is no longer copied into newly scaffolded projects.

## [2.8.0] - 2026-07-14

### Added
- Per-page SEO fields in `site.json`: `keywords`, `noindex`, `canonical`.
- `noindex` support: emits `<meta name="robots" content="noindex, follow">` and excludes the page from `sitemap.xml`.
- Per-page `canonical` and `keywords` overrides with global fallback.
- Global `theme_color` (`light` / `dark`), rendered as two `theme-color` meta tags via `prefers-color-scheme`.

### Changed
- Assistant CLI (`addSiteData`) now generates the full `seo` stub, including `keywords`, `noindex`, `canonical`.
- Moved `copyright` under `legal` in `site.json`; `footer.njk` updated accordingly.
- JSON-LD values are now serialized with the `dump` filter to prevent quotes/backslashes from breaking the block.

### Fixed
- `.htaccess` and `web.config` no longer block `robots.txt`, `sitemap.xml`, and `llms.txt`; the three server configs are now consistent with `nginx.conf`.
- Corrected `og:site_name` and `site.site_name` in `base.njk` (previously `og:site-name` / `site.site-name`, parsed by Nunjucks as subtraction).
- Removed the empty `theme-color` meta tag.
- `footer.njk` copyright referenced non-existent `site.name` / `site.title`; now uses `site.site_name` and `site.legal.copyright.*`.

### Migration
- `copyright` moved inside `legal`. In an existing `site.json`, relocate the block:
```json
  "legal": {
    "privacy": "",
    "cookie": "",
    "cookieControls": "",
    "terms": "",
    "copyright": { "year": "2026", "text": "Copyright text" }
  }
```
  Then update footer references from `site.copyright.*` to `site.legal.copyright.*`.
- Existing pages in `site.json` do not get the new `seo` fields retroactively. Add `keywords`, `noindex`, `canonical` manually where needed; templates fall back safely if absent.

[Unreleased]: https://github.com/Rhaastrake/berna-stencil/compare/v2.8.0...HEAD
[2.8.0]: https://github.com/Rhaastrake/berna-stencil/releases/tag/v2.8.0

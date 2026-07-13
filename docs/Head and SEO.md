# Head & SEO

Global settings live in `src/frontend/data/site.json` and are available everywhere via `{{ site.* }}`.

## Global fields

```json
{
  "site_name": "Site name",
  "title": "Site title",
  "description": "Site description",
  "keywords": "keyword1, keyword2, keyword3",
  "domain": "yoursite.com",
  "url": "https://yoursite.com",
  "lang": "en",
  "author": "Name and surname",
  "data_bs_theme": "dark",
  "theme_color": {
    "light": "#ffffff",
    "dark": "#0d1117"
  },
  "favicon": "/assets/brand/favicon.svg",
  "logo": "/assets/brand/logo.svg",
  "legal": {
    "privacy": "",
    "cookie": "",
    "cookieControls": "",
    "terms": "",
    "copyright": {
      "year": "2026",
      "text": "Copyright text"
    }
  }
}
```

| Field | Purpose |
|---|---|
| `site_name` | Brand name (used in meta tags and JSON-LD) |
| `title` | Default page title — fallback when a page has no `seo.title` |
| `description` | Default meta description — fallback for pages |
| `keywords` | Default meta keywords — fallback for pages |
| `domain` / `url` | Canonical URLs, `og:url`, JSON-LD |
| `lang` | HTML `lang` attribute |
| `author` | Meta author and JSON-LD author |
| `data_bs_theme` | Bootstrap color scheme (`light` / `dark`) |
| `theme_color` | Browser UI / PWA color, per scheme (`light` / `dark`) |
| `favicon` | Path to the favicon |
| `logo` | Path to the logo, also used as social image |
| `legal.privacy` / `cookie` / `cookieControls` / `terms` | Legal page URLs |
| `legal.copyright.year` / `text` | Footer copyright |

## Per-page SEO and CDN

Each page is keyed by its camelCase `title` from the front matter:

```json
"pages": {
  "examplePage": {
    "seo": {
      "title": "Example Page",
      "description": "Description",
      "keywords": "",
      "noindex": false,
      "canonical": ""
    },
    "cdn": {
      "css": ["https://example.com/lib.min.css"],
      "js": ["https://example.com/lib.min.js"]
    }
  }
}
```

| Field | Purpose | If empty / absent |
|---|---|---|
| `seo.title` | Page title | Falls back to global `title` |
| `seo.description` | Meta description | Falls back to global `description` |
| `seo.keywords` | Meta keywords | Falls back to global `keywords` |
| `seo.noindex` | If `true`, emits `<meta name="robots" content="noindex, follow">` and drops the page from the sitemap | Page is indexable |
| `seo.canonical` | Absolute canonical URL override | Computed as `url + page.url` |
| `cdn.css` / `cdn.js` | Extra per-page CDN links | No extra links loaded |

## Fallback logic

Global values are defaults, not duplicates. A page value is used when present; otherwise the global one applies:

```njk
{{ pageData.seo.title or title or site.title }}
{{ pageData.seo.description or site.description }}
{{ pageData.seo.keywords or site.keywords }}
```

`noindex` and `canonical` have no global default: `noindex` defaults to indexable behavior, `canonical` is computed from the URL. They exist per-page only.

## theme_color

Two tags are emitted so the browser bar follows the user's system scheme:

```njk
<meta name="theme-color" content="{{ site.theme_color.light }}" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="{{ site.theme_color.dark }}" media="(prefers-color-scheme: dark)">
```

This is independent from `data_bs_theme`, which controls the Bootstrap theme, not the browser UI.

## AI & SEO bots

`llms.txt`, `robots.txt` and `sitemap.xml` are generated from `.njk` templates and are publicly reachable (they must not be blocked by the server config).

| File | Purpose | Reachable at |
|---|---|---|
| `llms.njk` | Tells AI models what the site is about | `yoursite.com/llms.txt` |
| `robots.njk` | Controls search-engine crawling | `yoursite.com/robots.txt` |
| `sitemap.njk` | Lists indexable pages (skips drafts, 404, and `noindex`) | `yoursite.com/sitemap.xml` |

To customize, edit `src/frontend/llms.njk` or `src/frontend/robots.njk` directly.
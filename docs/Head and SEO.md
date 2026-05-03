# To be finished...

# Head & SEO

## site.json

`src/data/site.json` holds global settings used across all pages in `base.njk`:

```json
{
  "site_name": "My Site",
  "title": "Default Title",
  "description": "Default description",
  "keywords": "keyword1, keyword2",
  "url": "https://mysite.com",
  "lang": "en",
  "author": "Author Name",
  "favicon": "/assets/brand/favicon.svg",
  "logo": "/assets/brand/logo.svg"
}
```

## Per-page SEO

Each page entry is keyed by its camelCase `title` from the front matter:

```json
"pages": {
  "myPage": {
    "seo": {
      "title": "My Page | Site Name",
      "description": "Page-specific description"
    }
  }
}
```

If no entry is found, `base.njk` falls back to the global `site.title` and `site.description`.

## Legal links

Set the URLs for footer links in `site.json`:

```json
"legal": {
  "privacy": "/privacy-policy/",
  "cookie": "/cookie-policy/",
  "terms": "/terms/"
}
```

## Per-page CDN

Add extra CSS or JS only for a specific page via the front matter:

```njk
---
extra_css_cdn: |
  <link rel="stylesheet" href="https://cdn.example.com/lib.css">
extra_js_cdn: |
  <script src="https://cdn.example.com/lib.js"></script>
---
```

## Favicon

Replace the files in `src/assets/brand/`. SVG is the default. To use PNG instead, update the relevant lines in `base.njk`.
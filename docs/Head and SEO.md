# Head & SEO


This json holds global settings used across all pages in `base.njk` and other components:

### site.json <small>`src/frontend/data/`</small>
```json
"site_name": "Site name",
"title": "Site title",
"description": "Site description",
"keywords": "keyword1, keyword2, keyword3",
"domain": "yoursite.com",
"url": "https://yoursite.com",
"lang": "en",
"author": "Name and surname",
"data_bs_theme": "dark",
"favicon": "/assets/brand/favicon.svg",
"logo": "/assets/brand/logo.svg",
...
```

## Per-page SEO and CDN

Each page entry is keyed by its camelCase `title` from the front matter:

If you don't want to use a particular cdn inserting it in `base.njk` for all pages, you can add extra specific cdn (css, js) by inserting the link in each page of site.json separating them with a `,` and setting them in ""

### site.json <small>`src/frontend/data/`</small>
```json
"pages": {
    ...
    "examplePage": {
      "seo": {
        "title": "Example Page",
        "description": "description"
      },
      "cdn": {
        // You can leave the [] empty
        "css": ["https://example1.com/lib.min.css", "https://example2.com/lib.min.css"],
        "js": ["https://example1.com/lib.min.js", "https://example2.com/lib.min.js"]
      }
    }
    ...
}
```

## AI & SEO bots

`llms.txt` and `robots.txt` are generated automatically from `site.json` via their respective `.njk` files — no manual editing needed.

| File | Purpose | Reachable at |
|---|---|---|
| `llms.njk` | Tells AI models what your site is about | `yoursite.com/llms.txt` |
| `robots.njk` | Controls search engine crawling | `yoursite.com/robots.txt` |

To customize them, edit `src/llms.njk` or `src/robots.njk` directly.

## Configuration field description

| Field | Purpose |
|---|---|
| `site_name` | Brand name (used in meta tags) |
| `title` | Default page title |
| `description` | Default meta description |
| `keywords` | Default meta keywords |
| `domain` / `url` | Used for canonical URLs and og:url |
| `lang` | HTML `lang` attribute |
| `author` | Meta author tag |
| `data_bs_theme` | Bootstrap color scheme (`light` / `dark`) |
| `favicon` | Path to the favicon |
| `logo` | Path to the logo (available as `{{ site.logo }}`) |
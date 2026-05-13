# To be finished...

# Head & SEO

## site.json

`src/frontend/data/site.json` holds global settings used across all pages in `base.njk` and other components:

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

## Per-page SEO

Each page entry is keyed by its camelCase `title` from the front matter:

If you don't want to use a particular cdn inserting it in `base.njk` for all pages, you can add extra specific cdn (css, js) by inserting the link in each page of site.json separating them with a `,` and setting them in ""

```json
"pages": {
    "404": {
      "seo": {
        "title": "404 - Not found"
      },
      "cdn": {
        "css": [],
        "js": []
      }
    },
    "homepage": {
      "seo": {
        "title": "Homepage",
        "description": "Description"
      },
      "cdn": {
        "css": [],
        "js": []
      }
    },
    "examplePage": {
      "seo": {
        "title": "Example Page",
        "description": "description"
      },
      "cdn": {
        "css": [],
        "js": []
      }
    }
  }
}
```
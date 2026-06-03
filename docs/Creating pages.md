# Creating Pages

The recommended way is via the **Assistant CLI**

## What gets created
For a page named `my-page`:

| File | Purpose |
|---|---|
| `src/frontend/pages/my-page.njk` | Template with front matter |
| `src/frontend/scss/pages/myPage.scss` | Imports framework + modules |
| `src/frontend/js/pages/myPage.js` | Imports JS modules |

## Adding content

1. Create a component in `src/frontend/components/` (e.g. `_myPage.njk`)
2. Include it in `src/frontend/components/layouts/includes.njk` inside the generated `elif` block:

```njk
{% elif title == "myPage" %}
  {% include "_myPage.njk" %}
```

See **Components** DOC file for more info

## URL and title

The URL is the kebab-case name (`/my-page/`). The `title` in the front matter is camelCase (`myPage`) and is used internally to load the correct CSS and JS files — do not change it.

## SEO

The CLI creates a stub entry in `src/frontend/data/site.json`. Fill it in:

```json
"myPage": {
  "seo": {
    "title": "My Page | Site Name",
    "description": "Page description"
  }
}
```

See **Head & SEO** for all available options.
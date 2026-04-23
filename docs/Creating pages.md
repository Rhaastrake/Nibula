# Creating Pages

The recommended way is via the [Assistant CLI](assistant-cli.md).

## What gets created

For a page named `my-page`:

| File | Purpose |
|---|---|
| `src/pages/my-page.njk` | Template with front matter |
| `src/scss/pages/myPage.scss` | Imports framework + modules |
| `src/js/pages/myPage.js` | Imports JS modules |

## Adding content

1. Create a component in `src/components/` (e.g. `_myPage.njk`)
2. Include it in `src/layouts/includes.njk` inside the generated `elif` block:

```njk
{% elif title == "myPage" %}
  {% include "_myPage.njk" %}
```

See [components.md](components.md) for details.

## URL and title

The URL is the kebab-case name (`/my-page/`). The `title` in the front matter is camelCase (`myPage`) and is used internally to load the correct CSS and JS files — do not change it.

## SEO

The CLI creates a stub entry in `src/data/site.json`. Fill it in:

```json
"myPage": {
  "seo": {
    "title": "My Page | Site Name",
    "description": "Page description"
  }
}
```

See [head-and-seo.md](head-and-seo.md) for all available options.
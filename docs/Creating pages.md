# Creating Pages

> Examples use JavaScript, but everything applies equally to TypeScript. The only difference is the file extension (`.ts` instead of `.js`), that imports do **not** include the extension, and that paths use `src/frontend/ts/` instead of `src/frontend/js/`.

The recommended way is via the **Assistant CLI**

## What gets created
For a page named `my-page`:

| File | Purpose |
|---|---|
| `src/frontend/_routes_/my-page.njk` | Template with front matter |
| `src/frontend/scss/pages/myPage.scss` | Imports framework + modules |
| `src/frontend/js/pages/myPage.js` | Imports JS modules |

## Adding content

1. Create a component in `src/frontend/components/` (e.g. `_myPage.njk`)
2. Include it in `src/frontend/layouts/page-components.njk` inside the generated `elif` block:

```njk
{% elif title == "myPage" %}
  {% include "_myPage.njk" %}
```

See **Components** DOC file for more info

## URL and title

The URL is the kebab-case name (`/my-page/`). The `title` in the front matter is camelCase (`myPage`) and is used internally to load the correct CSS and JS files — do not change it.

## Subpages (nested URLs)

To create a URL like `domain.it/about/team`, edit the `permalink` in `src/frontend/_routes/team.njk` and add the parent segment before the final slash:

```njk
---
title: "team"
permalink: "about/team/"
layout: page-components.njk
---
```

The parent path (`about`) does **not** need to exist as a real page — it's just a URL prefix. Only the last segment (`team`) must match the filename and the `title` in the front matter.

| Goal URL | permalink value | File |
|---|---|---|
| `/team/` | `/team/` | `_routes/team.njk` |
| `/about/team/` | `/about/team/` | `_routes/team.njk` |
| `/company/about/team/` | `/company/about/team/` | `_routes/team.njk` |

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
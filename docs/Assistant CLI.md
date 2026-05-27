# Assistant CLI

An interactive CLI to manage pages without touching files manually.

```
npm run assistant
```

## Menu

```
1. Create page
2. Remove page
3. Rename page
4. Configure output path
```

Use `CTRL/CMD + C` to exit.

## Create page

Enter a page name in any format — the CLI converts it to kebab-case automatically.

For a page named `my-page`, the following files are created:

| File | Purpose |
|---|---|
| `src/frontend/scss/pages/myPage.scss` | SCSS entry point |
| `src/frontend/js/pages/myPage.js` | JS entry point |
| `src/frontend/_routes/my-page.njk` | Nunjucks template |

It also adds an `elif` block in `includes.njk` and a stub entry in `site.json`:

```json
"myPage": {
  "seo": {
    "title": "My Page",
    "description": "description"
  },
  "cdn": {
    "css": [],
    "js": []
  }
}
```

## Remove page

Deletes all source files for the page and cleans up the output directory, `includes.njk`, and `site.json`.

## Rename page

Renames all three source files, updates the `elif` block in `includes.njk`, and renames the record in `site.json` while preserving all existing fields.

## Configure output path

Updates the output directory across `.eleventy.js` and all relevant `package.json` scripts in one shot. The old output folder is deleted automatically.

> ⚠️ `homepage` and `404` are protected — they cannot be created, removed, or renamed via the CLI.
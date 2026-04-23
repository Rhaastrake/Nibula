# Assistant CLI

`assistant.js` is a CLI tool to manage pages and project configuration without editing files manually.

## Run
```bash
node assistant.js
```

## Options

### 1. Create a page
Enter a page name in kebab-case (e.g. `contact-us`). The CLI generates:

| File | Purpose |
|---|---|
| `src/pages/contact-us.njk` | Page template |
| `src/scss/pages/contactUs.scss` | Page styles |
| `src/js/pages/contactUs.js` | Page scripts |

It also registers the page automatically in:
- `src/layouts/includes.njk` — adds an `elif` block for component routing
- `src/data/site.json` — adds an SEO entry under `pages`

> Protected pages (`homepage`, `404`) cannot be created or removed.

### 2. Remove a page
Enter the page name to delete all related files and clean up registrations.

### 3. Configure output path
Change the build output directory. Updates both `.eleventy.js` and `package.json` automatically.

## Naming conventions
Page names are always kebab-case for URLs and file names (`contact-us`), and camelCase for SCSS and JS (`contactUs`). The CLI handles the conversion automatically.
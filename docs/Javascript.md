# To be finished...

# JavaScript

## Page files

Each page has a JS entry point in `src/js/pages/`. It is bundled by esbuild and loaded automatically by `base.njk`. Import only what the page needs.

## Module categories

**Call inside `DOMContentLoaded`** — these interact with the DOM and require the page to be fully loaded:

| Module | Function |
|---|---|
| `modules/langSwitcher.js` | `initLangSwitcher()` |
| `modules/forms/form.js` | `initFormListener()` |
| `modules/forms/textAreaAutoExpand.js` | `initTextAreaAutoExpand()` |
| `modules/forms/normalizePhoneNumber.js` | `initNormalizePhoneNumber()` |

**Call anywhere** — these create DOM elements dynamically and can be called at any point after the script loads:

| Module | Function |
|---|---|
| `modules/notification.js` | `showNotification(text, type, duration)` |

## Usage example

```js
import { initLangSwitcher } from '../modules/langSwitcher.js';
import { showNotification } from '../modules/notification.js';

document.addEventListener("DOMContentLoaded", () => {
  initLangSwitcher();
});

showNotification("Page loaded", "success", 3000);
```

## `showNotification` reference

| Parameter | Type | Default | Values |
|---|---|---|---|
| `text` | string | — | Any string |
| `type` | string | `"info"` | `"success"`, `"info"`, `"error"` |
| `duration` | number | `5000` | ms, or `-1` for persistent with spinner |

## Adding a module

Create a file in `src/js/modules/`, export your function, and import it in the pages that need it. Use ESM syntax (`import` / `export`) — this code is processed by esbuild.

## `assistant_utils/`

These scripts run directly in Node.js without a bundler. Use CommonJS syntax (`require` / `module.exports`) here, not ESM.
# JavaScript

## Page JS

Each page has its own JS entry point in `src/frontend/js/pages/`

It is bundled and minified by esbuild and loaded automatically by `base.njk`

Import only what the page needs.

### examplePage.js <small>(`src/frontend/js/pages/`)</small>
```js
import { showNotification } from '../modules/notification.js';

import { initNormalizePhoneNumber } from '../modules/forms/normalizePhoneNumber.js';

document.addEventListener("DOMContentLoaded", () => {
  initNormalizePhoneNumber();
});

showNotification("Page loaded", "success", 3000);
```

## Modules

Modules live in `src/frontend/js/modules/`. Some must be called inside `DOMContentLoaded` as they interact with the DOM; others create elements dynamically and can be called anywhere.

### Call inside `DOMContentLoaded`

| Module | Function |
|---|---|
| `modules/langSwitcher.js` | `initLangSwitcher()` |
| `modules/forms/form.js` | `initFormListener()` |
| `modules/forms/textAreaAutoExpand.js` | `initTextAreaAutoExpand()` |
| `modules/forms/normalizePhoneNumber.js` | `initNormalizePhoneNumber()` |

### Call anywhere

| Module | Function |
|---|---|
| `modules/notification.js` | `showNotification(text, type, duration)` |

### `showNotification` parameters

| Parameter | Type | Default | Values |
|---|---|---|---|
| `text` | string | — | Any string |
| `type` | string | `"info"` | `"success"`, `"info"`, `"error"` |
| `duration` | number | `5000` | ms, or `-1` for persistent with spinner |

## Adding a module

Create a new `.js` file in `src/frontend/js/modules/`. You can organize them into subfolders freely.

Use ESM syntax — esbuild handles the bundling:

```js
// _yourModule.js
export function yourFunction() {
  // ...
}
```

Then import it in the pages that need it:

```js
import { yourFunction } from '../modules/yourModule.js';
```

> ⚠️ Files inside `_tools/` run directly in Node.js without a bundler — use CommonJS (`require` / `module.exports`) there, not ESM.
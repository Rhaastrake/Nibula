# JavaScript

> Examples use JavaScript, but everything applies equally to TypeScript. The only difference is the file extension (`.ts` instead of `.js`), that imports do **not** include the extension, and that paths use `src/frontend/ts/` instead of `src/frontend/js/`.

## Page JS

Each page has its own JS entry point in `src/frontend/js/pages/`, bundled and minified by esbuild and loaded automatically by `base.njk`.

Import only what the page needs.

### examplePage.js <small>(`src/frontend/js/pages/`)</small>

```js
//===========================
// JAVASCRIPT MODULES IMPORTS
//===========================

// import { initExampleModule } from '../modules/exampleModule.js';

//==========================
// PAGE CUSTOM JAVASCRIPT
//==========================

document.addEventListener("DOMContentLoaded", () => {
    // initExampleModule();
});
```

## Modules

Modules live in `src/frontend/js/modules/`. Modules that interact with the DOM must be called inside `DOMContentLoaded`; others can be called anywhere.

## Adding a module

Create a new `.js` file in `src/frontend/js/modules/`. Subfolders are allowed.

Use ESM syntax — esbuild handles the bundling:

### exampleModule.js <small>(`src/frontend/js/modules/`)</small>

```js
//==========================
// EXAMPLE MODULE
//==========================

export function exampleModule() {
    // Example module logic
}
```

Then import it in the pages that need it:

```js
import { exampleModule } from '../modules/exampleModule.js';
```

In TypeScript, omit the extension:

```ts
import { exampleModule } from '../modules/exampleModule';
```

> ⚠️ Files inside `_tools/` run directly in Node.js without a bundler — use CommonJS (`require` / `module.exports`) there, not ESM.
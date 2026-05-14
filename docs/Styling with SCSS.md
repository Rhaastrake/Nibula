# Styling with SCSS

## Page CSS

Each page has its own SCSS entry point in `src/frontend/scss/pages/`

It must contain `_root.scss` + other modules like `_global.scss` or any other one that you need and its own specific css rules

`_root.scss` uses `@use` to enable namespaced access (`root.$var`); other modules use `@import` as they don't expose variables.
### examplePage.scss <small>(`src/frontend/scss/pages/`)</small>
```scss
//==========================
// CSS MODULES IMPORTS
//==========================

@use "../modules/root" as root;

@import "../modules/global";

@import "../modules/notification";

//==========================
// PAGE CUSTOM CSS RULES
//==========================

body {
  background-color: root.$primary;
}
```

## CSS Framework

Some of the most popular css frameworks that supports scss with modules are already installed in `node_modules`

You can choose one or none of them (more than 1 works, but you may get in various conflicts)

To enable/disable them you have to modify 3 files around the project by just commenting them


### 1. _global.scss <small>(`src/frontend/scss/modules/`)</small>
```scss
@import "../modules/frameworks/bootstrap";
// @import "../modules/frameworks/bulma";
// @import "../modules/frameworks/foundation";
// @import "../modules/frameworks/uikit";
```

### 2. base.njk <small>(`src/frontend/components/layouts/`)</small>

```html
{# Bootstrap JS #}
<script src="/js/bootstrap.bundle.min.js" defer></script>

{# Foundation JS #}
{# <script src="/js/foundation.min.js" defer></script> #}

{# UIkit JS #}
{# <script src="/js/uikit.min.js" defer></script> #}
{# <script src="/js/uikit-icons.min.js" defer></script> #}

{# Bulma — no JS needed #}
```

### 3. `.eleventy.js`

```javascript
eleventyConfig.addPassthroughCopy({
  // Bootstrap
  "node_modules/bootstrap/dist/js/bootstrap.bundle.min.js": "js/bootstrap.bundle.min.js",
  "node_modules/bootstrap-icons/font/fonts": "css/fonts",

  // Foundation
  // "node_modules/foundation-sites/dist/js/foundation.min.js": "js/foundation.min.js",

  // UIkit
  // "node_modules/uikit/dist/js/uikit.min.js": "js/uikit.min.js",
  // "node_modules/uikit/dist/js/uikit-icons.min.js": "js/uikit-icons.min.js",

  // Bulma — CSS only, no JS passthrough needed
});
```

### Reducing bundle size
To reduce the bundle size, open the corresponding framework file (`src/frontend/scss/modules/frameworks/`) and comment out any modules you don't need
```scss
@import "../../../../../node_modules/bootstrap/scss/card"; // Cards
@import "../../../../../node_modules/bootstrap/scss/carousel"; // Carousel
```

## Global Variables

Instead of using `:root` in your custom modules or pages, the best thing to do is to centralize all your variables in a single file (that will be tree-shaken automatically by Sass)

### _root.scss <small>(`src/frontend/scss/modules/`)</small>
```scss
$header-height: 10vh;

// Usage example (in any other file): 
header {
  height: root.$header-height;
}
```
## Scss modules
You can create your custom css modules by creating a new `.scss` file in `src/frontend/scss/modules/` (the name of the file must start with `_`)

You can create subfolders if you want to refactor the structure, but be sure to update the relative paths in the pages that import them

### _yourModule.scss <small>(`src/frontend/scss/modules/subfolder/`)</small>
```scss
@use '../root' as root;

body {
  background-color: root.$primary;
}
```

### examplePage.scss
```scss
@import "../modules/subfolder/yourModule";

// This page will now inherit the body tag rules
// If the same property is declared in both, the last imported one wins
body {
  color: root.$dark;
}
```

### Pre-existing modules

| File | Purpose |
|---|---|
| `_root.scss` | Global variables (colors, spacing) |
| `_global.scss` | Site-wide base rules and frameworks |
| `_typography.scss` | Font rules
| `_header.scss` | Header styles |
| `_footer.scss` | Footer styles |
| `_mobile.scss` | Media query rules |
| `_buttons.scss` | Style and hovers for buttons 
| `_animations.scss` | Keyframe animations (`fade-in`, `spin`) |
| `_notification.scss` | Notification component style |
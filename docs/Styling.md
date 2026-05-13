# Styling

## Page CSS

Each page has its own SCSS entry point in `src/frontend/scss/pages/`

It must contain `_root.scss` + other modules like `_global.scss` or any other one that you need and its own specific css rules

### examplePage.scss
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

Some of the most popular css frameworks that supports scss with modules are already installed

You can choose one or none of them (more than 1 works, but you may get in vrious conflicts)

### _global.scss
```scss
@import "../modules/frameworks/bootstrap";
// @import "../modules/frameworks/bulma";
// @import "../modules/frameworks/foundation";
// @import "../modules/frameworks/uikit";
```

To reduce the bundle size, open the corresponding framework file (e.g. `src/scss/modules/frameworks/_bootstrap.scss`) and comment out any modules you don't need.

## Switching framework — full checklist

Changing framework requires touching three files:

### 1. `base.njk` — framework JS scripts
Comment out Bootstrap and uncomment the one you need:

```njk
{# Bootstrap JS #}
<script src="/js/bootstrap.bundle.min.js" defer></script>

{# Foundation JS #}
{# <script src="/js/foundation.min.js" defer></script> #}

{# UIkit JS #}
{# <script src="/js/uikit.min.js" defer></script> #}
{# <script src="/js/uikit-icons.min.js" defer></script> #}

{# Bulma — no JS needed #}
```

### 2. `.eleventy.js` — JS passthrough
All frameworks are configured in the passthrough block. Foundation and UIkit are commented out by default — uncomment the lines for the framework you are using.

## Global Variables

Defined in `src/scss/modules/_root.scss`. Import with a namespace to avoid conflicts:

```scss
@use "../modules/root" as root;

height: root.$header-height;
color: root.$primary;
```

## Modules

| File | Purpose |
|---|---|
| `_root.scss` | Global variables (colors, spacing) |
| `_global.scss` | Site-wide base rules |
| `_header.scss` | Header styles |
| `_footer.scss` | Footer styles |
| `_notification.scss` | Notification component |
| `_animations.scss` | Keyframe animations (`fade-in`, `spin`) |
| `_mobile.scss` | Responsive breakpoint overrides |
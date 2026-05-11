# To be finished...

# Components

## Create a component

Add a Nunjucks file in `src/components/`:

```
src/components/myComponent.njk
```

## Subfolders

Components can be organized into subfolders freely. Some examples:

```
src/components/
├── global/          # Header, footer — included in every page
├── pages/           # Page-specific components
│   ├── homepage.njk
│   └── contactUs.njk
└── modals/          # Shared modals (privacy, cookies, etc.)
    └── privacyModal.njk
```

The include path must reflect the subfolder:

```njk
{% include "pages/homepage.njk" %}
{% include "modals/privacyModal.njk" %}
```

## Register it for a page

In `src/layouts/includes.njk`, find the `elif` block for your page and include the component:

```njk
{% elif title == "myPage" %}
  {% include "myComponent.njk" %}
```

Multiple components can be included in the same block:

```njk
{% elif title == "myPage" %}
  {% include "hero.njk" %}
  {% include "features.njk" %}
```

## Global components

Header and footer live in `src/components/global/` and are automatically included in every page via `base.njk`. Edit them to change the site-wide layout.

## Site data in components

All values from `src/data/site.json` are available as `{{ site.* }}`:

```njk
<p>{{ site.title }}</p>
<a href="{{ site.legal.privacy }}">Privacy Policy</a>
<img src="{{ site.logo }}" alt="{{ site.title }}">
```
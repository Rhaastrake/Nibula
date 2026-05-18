# Nunjucks (HTML) Components

## What is Nunjucks

Nunjucks (`.njk`) is an HTML file that supports logic like variables, `if` statements, and `for` loops. It can extend a base layout and include other `.njk` components

## Create a component

Create a new `.njk` file anywhere inside `src/frontend/components/`. You can organize them into subfolders freely

```
src/frontend/components/
├── global/
├── layouts/
├── modals/
│   └── privacyModal.njk # You can move it to a modals/subfolder
├── welcome.njk
```

## Include a component

To render a component inside a page, navigate to `src/frontend/components/layouts/` and edit `includes.njk`

### includes.njk <small>(`src/frontend/components/layouts/`)</small>

```js
{% if title == "homepage" %}
  {% include "welcome.njk" %}

{% elif title == "examplePage" %}
  {% include "exampleComponent1.njk" %}
  {% include "subfolder/exampleComponent2.njk" %}

{% else %}
  {% include "404/_404.njk" %}
  {{ content | safe }}
{% endif %}
```

Add a new `{% elif %}` block for each page, listing its components in order. If a component lives in a subfolder, specify the relative path accordingly

> ⚠️ A new `elif` block is automatically added when you create a page via the Assistant CLI

> ⚠️ If you move or delete a component, always update `includes.njk` or the site will break

## Nest components

A component can include other components. This is useful for breaking complex sections into smaller, reusable pieces.

### exampleComponent.njk
```js
<section class="hero">
  {% include "ui/heroTitle.njk" %}
  {% include "ui/heroButton.njk" %}
</section>
```

> The same path rules apply: if the included component is in a subfolder, specify the full relative path.

## Global components

Header and footer live in `src/frontend/components/global/` and are automatically included in every page via `base.njk`. Edit them to change the site-wide layout

## Site data in components

All values defined in `src/data/site.json` are globally available in every component via `{{ site.* }}`

### site.json <small>(`src/data/`)</small>
```json
{
  "title": "My Site",
  "logo": "/img/logo.png",
  "legal": {
    "privacy": "/privacy"
  }
}
```

### Usage in any `.njk` file
```js
<p>{{ site.title }}</p>
<a href="{{ site.legal.privacy }}">Privacy Policy</a>
<img src="{{ site.logo }}" alt="{{ site.title }}">
```
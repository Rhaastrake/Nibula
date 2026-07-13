# ✏️ Berna-Stencil
**Berna-Stencil** is an open source static site generator built on top of [Eleventy](https://www.11ty.dev/), designed with one clear mission: make web development simple, approachable, and enjoyable — for everyone.

Berna-Stencil stays deliberately close to plain, vanilla web development — you work with real HTML, CSS, and JavaScript, not a heavy abstraction layer to learn first. That means a gentle, fast learning curve: the skills you build here are the same ones you'd use anywhere on the web.

Whether you're a seasoned developer looking for a clean starting point or a beginner taking your first steps into the world of web creation, Berna-Stencil gives you everything you need, right out of the box. No complicated setup, no hours spent reading documentation, no frustration — just a solid, well-structured foundation ready to become your next website.

### ✨ Why Berna-Stencil?

Building a website from scratch involves a lot of moving parts: templating engines, build pipelines, asset management, backend logic, project structure. Berna-Stencil takes care of all of that for you, so you can focus on what actually matters — **your content and your ideas**.

Because it keeps you close to the fundamentals instead of hiding them, you spend your time actually learning the web — not memorizing a framework's conventions that stop being useful the moment you switch tool.

- 🔧 **Zero-config ready** — install, create, and you're live in minutes
- 🔗 **Integrated backend** — essential server-side functionality included, no extra setup required
- 📁 **Scalable structure** — a clean, opinionated project layout that grows with your needs
- 🌍 **Open source** — free to use, free to modify, free to share

![Version](https://img.shields.io/badge/version-2.8.0-blue)
![License](https://img.shields.io/badge/license-Apache--2.0-blue)
![Eleventy](https://img.shields.io/badge/11ty-v3.1.2-black)

## Prerequisites
* **Node.js**: v18.0.0 or higher
* **Composer**: latest stable version
* #### Optional: Better Nunjucks VS Code extension by Ed Heltzel

## Installation
Install the Berna-Stencil CLI once, globally:

```bash
npm install -g berna-stencil
```

This gives you the `bs` command (and its identical alias `berna`).

## Create a project
From the folder that contains your websites, run:

```bash
bs new your-project
```

The scaffolder is interactive: you choose the language (JavaScript/TypeScript) and the CSS framework, and all dependencies are installed automatically.

Then start the dev server and visit `localhost:8080`:

```bash
cd your-project
bs run
```

## Commands
Run these from anywhere inside a project (except `bs new`, which you run wherever you want to create the project):

| Command | Description |
|---|---|
| `bs new <name>` | Scaffold a new project |
| `bs run` | Start the dev server |
| `bs build` | Build the site |
| `bs cli` | Open the page-management assistant |
| `bs update` | Update the CLI to the latest version |
| `bs ver` | Show the installed and latest version |
| `bs help` | Show the available commands |

Before scaffolding, `bs new` checks the npm registry for a newer version and offers to update first (via `bs update`). If the registry is unreachable, the check is skipped and creation proceeds normally.

> `berna` is an identical alias for `bs`, if you prefer the longer name (`berna new …`, `berna run`, `berna cli`).

## Managing pages
To create, remove or rename pages and configure the output path, open the interactive assistant:

```bash
bs cli
```

See [docs/Assistant CLI.md](docs/Assistant%20CLI.md) for details.

## Roadmap
* [ ] Add support for multiple themes
* [ ] Backend integration choice and switch between php, python or node
# Microfrontend Demo

Angular 14 and Angular 20 running simultaneously in a framework-agnostic shell, using Web Components.

## Architecture

```
shell-app/          Vanilla HTML/CSS/JS - hash router, dynamic script loader
mfe-angular14/      Angular 14 MFE wrapped as <mfe-angular14> custom element
mfe-angular20/      Angular 20 MFE wrapped as <mfe-angular20> custom element
server.js           Express static file server
build.bat           Orchestrated build with nvm Node version switching
```

Each Angular MFE is packaged as a **Web Component** using `@angular/elements`. The shell dynamically loads MFE bundles and renders their custom elements. Zone.js is loaded once by the shell and shared by all MFEs.

## Prerequisites

- [nvm-windows](https://github.com/coreybutler/nvm-windows)
- Node 16.x (`nvm install 16.20.2`) for Angular 14
- Node 25.x (`nvm install 25.6.0`) for Angular 20
- Administrator terminal (required for `nvm use` on Windows)

## Build

From an Administrator terminal:

```
build.bat
```

This switches Node versions via nvm and builds both MFEs.

## Run

```
npm install
node server.js
```

Open http://localhost:4000

## Routes

| Route | Description |
|-------|-------------|
| `#/home` | Welcome page |
| `#/angular14` | Angular 14 MFE only |
| `#/angular20` | Angular 20 MFE only |
| `#/both` | Both MFEs side by side |

## How It Works

- **Shell** loads Zone.js from CDN and provides hash-based routing with dynamic `<script>` loading
- **Angular 14** uses `ngx-build-plus` for single-bundle output and `@NgModule` + `DoBootstrap` to register the custom element
- **Angular 20** uses `createApplication()` + `createCustomElement()` with standalone components
- Zone.js is excluded from both MFE builds to avoid duplicate patching

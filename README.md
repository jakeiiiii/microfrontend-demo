# Microfrontend Demo

Six Angular microfrontends (three Angular 14, three Angular 20) running simultaneously in a framework-agnostic shell, sharing framework code via federation.

## Architecture

```
shell-app/          Vanilla HTML/CSS/JS - dual federation loaders + hash router
mfe-angular14/      Angular 14 MFE A (blue)      ┐
mfe-angular14-b/    Angular 14 MFE B (orange)     ├─ Webpack Module Federation
mfe-angular14-c/    Angular 14 MFE C (purple)     ┘
mfe-angular20/      Angular 20 MFE A (red)        ┐
mfe-angular20-b/    Angular 20 MFE B (green)      ├─ Native Federation (import maps)
mfe-angular20-c/    Angular 20 MFE C (teal)       ┘
server.js           Express static file server
build.bat           Orchestrated build with nvm Node version switching
```

Each Angular MFE is packaged as a **Web Component** using `@angular/elements`. The shell dynamically loads MFE bundles and renders their custom elements.

**Angular 14 MFEs** share a single copy of the Angular 14 framework via **Webpack Module Federation** (shared scope protocol). **Angular 20 MFEs** share a single copy of the Angular 20 framework via **Native Federation** (ES module import maps + es-module-shims). Zone.js is loaded once by the shell and shared by all MFEs.

See [ARCHITECTURE.md](ARCHITECTURE.md) for full technical details.

## Prerequisites

- [nvm-windows](https://github.com/coreybutler/nvm-windows)
- Node 16.x (`nvm install 16.20.2`) for Angular 14
- Node 25.x (`nvm install 25.6.0`) for Angular 20
- Administrator terminal (required for `nvm use` on Windows)

## Install Dependencies

Each MFE has its own `node_modules`. Install on the correct Node version:

```bash
# Angular 14 MFEs (Node 16)
nvm use 16.20.2
cd mfe-angular14 && npm install && cd ..
cd mfe-angular14-b && npm install && cd ..
cd mfe-angular14-c && npm install && cd ..

# Angular 20 MFEs (Node 25)
nvm use 25.6.0
cd mfe-angular20 && npm install && cd ..
cd mfe-angular20-b && npm install && cd ..
cd mfe-angular20-c && npm install && cd ..

# Server (any Node version)
npm install
```

## Build

From an Administrator terminal:

```
build.bat
```

This switches Node versions via nvm and builds all 6 MFEs.

## Run

```
node server.js
```

Open http://localhost:4000

## Routes

| Route | Description |
|-------|-------------|
| `#/home` | Welcome page |
| `#/angular14` | All three Angular 14 MFEs (demonstrates Webpack MF sharing) |
| `#/angular20` | All three Angular 20 MFEs (demonstrates Native Federation sharing) |
| `#/all` | All six MFEs simultaneously |

## How It Works

- **Shell** loads Zone.js from CDN, es-module-shims for import map support, and provides hash-based routing with two federation loaders
- **Angular 14 MFEs** use `ngx-build-plus` + Webpack Module Federation. The shell creates a shared scope, calls `container.init(scope)` on each — first MFE populates shared modules, subsequent MFEs reuse them
- **Angular 20 MFEs** use `@angular-architects/native-federation`. The shell fetches `remoteEntry.json` from each, builds a deduplicated import map, and loads modules via `importShim()`
- **Zone.js** is excluded from all MFE builds to avoid duplicate patching
- Each additional MFE adds only ~5-10KB (app code) since the framework is already shared

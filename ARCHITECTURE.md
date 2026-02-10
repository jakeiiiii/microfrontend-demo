# Architecture Document

## Overview

This project demonstrates a microfrontend architecture where Angular 14 and Angular 20 applications run simultaneously within a single browser page. The shell application is framework-agnostic (vanilla HTML/CSS/JS), and each microfrontend is packaged as a Web Component using `@angular/elements`.

## Problem Statement

Angular 14 and Angular 20 have incompatible build-time requirements:

| Constraint | Angular 14 | Angular 20 |
|------------|-----------|-----------|
| Node.js | 16.x | 22.x+ |
| TypeScript | 4.7.x | 5.8.x |
| Zone.js | 0.11.x | 0.15.x |
| Module System | NgModule-based | Standalone components |

Despite these build-time incompatibilities, the compiled JavaScript output from both versions must coexist at runtime without conflicts.

## Solution: Web Components as Integration Layer

```
┌─────────────────────────────────────────────────────────┐
│                     Browser                             │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │              Shell App (Vanilla JS)                │  │
│  │                                                   │  │
│  │  ┌─────────┐  ┌──────────┐  ┌──────────────────┐ │  │
│  │  │  Router  │  │  Script  │  │  MFE Container   │ │  │
│  │  │ (hash)  │  │  Loader  │  │                  │ │  │
│  │  └────┬────┘  └────┬─────┘  │ ┌──────────────┐ │ │  │
│  │       │            │        │ │<mfe-angular14>│ │ │  │
│  │       └────────────┘        │ │  Angular 14   │ │ │  │
│  │                             │ │  Runtime      │ │ │  │
│  │                             │ └──────────────┘ │ │  │
│  │                             │ ┌──────────────┐ │ │  │
│  │                             │ │<mfe-angular20>│ │ │  │
│  │                             │ │  Angular 20   │ │ │  │
│  │                             │ │  Runtime      │ │ │  │
│  │                             │ └──────────────┘ │ │  │
│  │                             └──────────────────┘ │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │           Zone.js (loaded once by shell)           │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Why Web Components

- **Framework agnostic**: The shell has zero Angular dependencies. MFEs register as standard Custom Elements.
- **Encapsulation**: Each MFE manages its own component tree, change detection, and dependency injection.
- **Browser-native**: No special runtime, federation plugin, or import map system required.
- **Lazy loading**: MFE bundles are loaded on demand via dynamic `<script>` injection.

## Component Details

### Shell App

**Technology**: Vanilla HTML/CSS/JS (no build step)

**Responsibilities**:
1. Load Zone.js once from CDN (shared global dependency)
2. Render navigation header
3. Route based on URL hash (`#/angular14`, `#/angular20`, `#/both`)
4. Dynamically inject MFE `<script>` tags on navigation
5. Render MFE custom elements into the container

**Script Loading Strategy**:
```
User clicks nav link
  → hashchange event fires
  → Router reads hash, looks up MFE in registry
  → Script loader injects <script> tag (if not already loaded)
  → Script executes, Angular bootstraps, custom element is registered
  → Shell inserts custom element tag into DOM
  → Browser instantiates the custom element → MFE renders
```

Scripts are loaded once and cached. Subsequent navigations reuse the already-registered custom elements.

### Angular 14 MFE

**Build tooling**: `ngx-build-plus` (produces a single `main.js` + `runtime.js` bundle without hashed filenames)

**Bootstrap sequence**:
1. `main.ts` calls `platformBrowserDynamic().bootstrapModule(AppModule)`
2. `AppModule` implements `DoBootstrap` (no `bootstrap` array in `@NgModule`)
3. `ngDoBootstrap()` calls `createCustomElement(MfeComponent, ...)` and registers `<mfe-angular14>`
4. The platform and injector remain alive for the lifetime of the page

**Key configuration**:
- `angular.json`: Builder changed to `ngx-build-plus:browser`, `outputHashing: "none"`
- `polyfills.ts`: Zone.js import removed (shell provides it)
- `@types/node` pinned to v16 (newer versions use TypeScript features unsupported by TS 4.7)

### Angular 20 MFE

**Build tooling**: `@angular/build:application` (default Angular 20 builder)

**Bootstrap sequence**:
1. `main.ts` calls `createApplication()` with `provideZoneChangeDetection()` provider
2. The returned `ApplicationRef` injector is used to create the custom element
3. `createCustomElement(MfeComponent, ...)` registers `<mfe-angular20>`

**Key configuration**:
- `angular.json`: Zone.js removed from polyfills array, `outputHashing: "none"`
- Standalone component (no NgModule)

## Zone.js Sharing Strategy

Zone.js monkey-patches browser APIs (setTimeout, Promise, addEventListener, etc.) to enable Angular's change detection. Loading it multiple times causes errors because the patches are applied globally and are not idempotent.

**Solution**: The shell loads Zone.js exactly once via a blocking `<script>` tag in `<head>`. Both MFE builds exclude Zone.js from their bundles:

| Layer | Zone.js Handling |
|-------|-----------------|
| Shell `index.html` | `<script src="...zone.umd.min.js">` in `<head>` |
| Angular 14 | `polyfills.ts`: Zone.js import commented out |
| Angular 20 | `angular.json`: Empty polyfills array, `provideZoneChangeDetection()` in providers |

This ensures Zone.js is available globally before any MFE script executes, and avoids duplicate patching conflicts.

## Build Pipeline

Angular 14 and 20 cannot be built with the same Node.js version. The build script (`build.bat`) orchestrates this using nvm:

```
build.bat
  ├── nvm use 16.20.2
  ├── cd mfe-angular14 && ng build --configuration production
  ├── nvm use 25.6.0
  └── cd mfe-angular20 && ng build --configuration production
```

**Requires**: Administrator terminal on Windows (nvm symlink requires elevated privileges).

Build outputs:
```
mfe-angular14/dist/mfe-angular14/
  ├── runtime.js          (webpack runtime)
  └── main.js             (application + Angular framework)

mfe-angular20/dist/mfe-angular20/browser/
  └── main.js             (application + Angular framework, esbuild output)
```

## Server Architecture

Express.js serves static files with path mapping:

| URL Path | Filesystem Path |
|----------|----------------|
| `/` | `shell-app/` |
| `/mfe/angular14/*` | `mfe-angular14/dist/mfe-angular14/*` |
| `/mfe/angular20/*` | `mfe-angular20/dist/mfe-angular20/browser/*` |

Note the `browser/` subdirectory for Angular 20 — the `@angular/build:application` builder outputs to a `browser/` folder (it also supports SSR output in a `server/` folder).

## Runtime Isolation

Each Angular MFE brings its own copy of the Angular framework (core, compiler, platform-browser, etc.) in its bundle. The two Angular runtimes coexist because:

1. **No global state conflicts**: Angular's runtime state is scoped to its platform instance and injector tree, not global variables.
2. **Separate custom element names**: `<mfe-angular14>` and `<mfe-angular20>` are distinct registrations.
3. **Shared Zone.js**: Both runtimes hook into the same Zone.js instance, which is designed to support multiple consumers.
4. **No DOM conflicts**: Each MFE renders within its own custom element boundary.

## Trade-offs and Limitations

| Trade-off | Impact |
|-----------|--------|
| Duplicate Angular runtime | Each MFE includes ~100KB of Angular framework code. Total page weight increases with each MFE. |
| No shared dependencies | Libraries used by multiple MFEs are bundled separately in each. |
| Zone.js version coupling | The CDN version must be compatible with all Angular versions in use. |
| Build complexity | nvm switching and separate `npm install` per MFE adds CI/CD complexity. |
| No cross-MFE communication | MFEs are isolated. Communication would require custom events, a shared service, or a message bus. |

## Extending This Architecture

**Adding a new MFE**: Create a new Angular (or React, Vue, etc.) project, package it as a custom element, add its script path to the MFE registry in `shell-app/app.js`, and add a static file route in `server.js`.

**Cross-MFE communication**: Use `CustomEvent` dispatched on `window` or `document`, or implement a lightweight event bus in the shell.

**Production deployment**: Replace the Express server with a CDN or reverse proxy. Each MFE can be deployed independently to its own URL path.

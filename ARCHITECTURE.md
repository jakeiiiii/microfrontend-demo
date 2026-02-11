# Architecture Document

## Overview

This project demonstrates a microfrontend architecture where six Angular applications (three Angular 14, three Angular 20) run simultaneously within a single browser page. The shell application is framework-agnostic (vanilla HTML/CSS/JS). Each microfrontend is packaged as a Web Component using `@angular/elements`.

Angular 14 MFEs share a single copy of the Angular 14 framework via **Webpack Module Federation**. Angular 20 MFEs share a single copy of the Angular 20 framework via **Native Federation** (import maps). This eliminates the duplicate framework overhead that would otherwise grow linearly with each additional MFE.

## Problem Statement

Angular 14 and Angular 20 have incompatible build-time requirements:

| Constraint | Angular 14 | Angular 20 |
|------------|-----------|-----------|
| Node.js | 16.x | 22.x+ |
| TypeScript | 4.7.x | 5.9.x |
| Zone.js | 0.11.x | 0.15.x |
| Module System | NgModule-based | Standalone components |

Despite these build-time incompatibilities, the compiled JavaScript output from both versions must coexist at runtime without conflicts. Additionally, naively bundling each MFE independently would duplicate the Angular framework (~100KB) in every MFE bundle.

## Solution: Federation + Web Components

```
┌──────────────────────────────────────────────────────────────────────┐
│                            Browser                                    │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │                  Shell App (Vanilla JS)                         │   │
│  │                                                                │   │
│  │  ┌──────────┐  ┌───────────────────┐  ┌────────────────────┐  │   │
│  │  │  Router   │  │  MF Loader        │  │  NF Loader         │  │   │
│  │  │  (hash)   │  │  (Webpack MF)     │  │  (Import Maps)     │  │   │
│  │  └────┬─────┘  └────────┬──────────┘  └─────────┬──────────┘  │   │
│  │       │                 │                        │             │   │
│  │  ┌────┴─────────────────┴────────────────────────┴──────────┐  │   │
│  │  │                    MFE Container                          │  │   │
│  │  │                                                           │  │   │
│  │  │  ┌─────────────┐ ┌──────────────┐ ┌──────────────┐      │  │   │
│  │  │  │<mfe-angular  │ │<mfe-angular  │ │<mfe-angular  │      │  │   │
│  │  │  │ 14>          │ │ 14-b>        │ │ 14-c>        │      │  │   │
│  │  │  │ Shared Ng14  │ │ Shared Ng14  │ │ Shared Ng14  │      │  │   │
│  │  │  │ Runtime ─────┼─┤ Runtime ─────┼─┤ Runtime      │      │  │   │
│  │  │  └─────────────┘ └──────────────┘ └──────────────┘      │  │   │
│  │  │                                                           │  │   │
│  │  │  ┌─────────────┐ ┌──────────────┐ ┌──────────────┐      │  │   │
│  │  │  │<mfe-angular  │ │<mfe-angular  │ │<mfe-angular  │      │  │   │
│  │  │  │ 20>          │ │ 20-b>        │ │ 20-c>        │      │  │   │
│  │  │  │ Shared Ng20  │ │ Shared Ng20  │ │ Shared Ng20  │      │  │   │
│  │  │  │ Runtime ─────┼─┤ Runtime ─────┼─┤ Runtime      │      │  │   │
│  │  │  └─────────────┘ └──────────────┘ └──────────────┘      │  │   │
│  │  └───────────────────────────────────────────────────────────┘  │   │
│  └────────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │  Zone.js (loaded once by shell)                                │   │
│  │  es-module-shims (polyfill for dynamic import maps)            │   │
│  └────────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────┘
```

### Why Web Components + Federation

- **Framework agnostic**: The shell has zero Angular dependencies. MFEs register as standard Custom Elements.
- **Encapsulation**: Each MFE manages its own component tree, change detection, and dependency injection.
- **Shared framework code**: MFEs of the same Angular version share one copy of the framework via federation, eliminating duplicate bundles.
- **Lazy loading**: MFE bundles are loaded on demand via dynamic script/module injection.
- **Independently deployable**: Each MFE can be built and deployed separately.

## Project Structure

```
microfrontend-demo/
├── shell-app/
│   ├── index.html              # Navigation, Zone.js CDN, es-module-shims
│   ├── styles.css              # Layout and theming
│   └── app.js                  # Dual federation loaders + hash router
│
├── mfe-angular14/              # Angular 14 MFE A (blue #3498db)
│   ├── webpack.config.js       # Module Federation config
│   ├── angular.json            # ngx-build-plus + extraWebpackConfig
│   └── src/
│
├── mfe-angular14-b/            # Angular 14 MFE B (orange #e67e22)
│   ├── webpack.config.js       # Module Federation config
│   ├── angular.json            # ngx-build-plus + extraWebpackConfig
│   └── src/
│
├── mfe-angular14-c/            # Angular 14 MFE C (purple #9b59b6)
│   ├── webpack.config.js       # Module Federation config
│   ├── angular.json            # ngx-build-plus + extraWebpackConfig
│   └── src/
│
├── mfe-angular20/              # Angular 20 MFE A (red/coral #e74c3c)
│   ├── federation.config.js    # Native Federation config
│   ├── angular.json            # NF builder wrapping @angular/build
│   └── src/
│       ├── main.ts             # initFederation() → import('./bootstrap')
│       └── bootstrap.ts        # createApplication() + custom element
│
├── mfe-angular20-b/            # Angular 20 MFE B (green #27ae60)
│   ├── federation.config.js    # Native Federation config
│   ├── angular.json            # NF builder wrapping @angular/build
│   └── src/
│
├── mfe-angular20-c/            # Angular 20 MFE C (teal #1abc9c)
│   ├── federation.config.js    # Native Federation config
│   ├── angular.json            # NF builder wrapping @angular/build
│   └── src/
│
├── server.js                   # Express static file server
└── build.bat                   # Multi-step build with nvm switching
```

## Federation Mechanisms

### Webpack Module Federation (Angular 14 MFEs)

Angular 14 MFEs use the `@angular-architects/module-federation` package which wraps Webpack's `ModuleFederationPlugin`.

**How it works**:

1. Each MFE exposes its `main.ts` as `./bootstrap` via a `remoteEntry.js` file
2. The webpack config uses `library: { type: 'var', name: '<containerName>' }` so the container registers on `window` (required since the shell has no webpack)
3. An explicit `output.publicPath` is set (e.g., `/mfe/angular14/`) because `import.meta.url`-based auto detection doesn't work in regular `<script>` contexts

**Shell loading sequence**:

```
1. Load remoteEntry.js for each Angular 14 MFE (parallel <script> tags)
   → Registers window.mfeAngular14, window.mfeAngular14B, window.mfeAngular14C

2. Create shared scope object (plain JS object)
   → Call container.init(sharedScope) on each container sequentially
   → First container populates scope with Angular 14 shared modules
   → Subsequent containers find existing entries and reuse them

3. Load exposed modules
   → container.get('./bootstrap') returns a factory
   → factory() executes main.ts → Angular bootstraps → custom element registered
```

**Key insight**: The shared scope protocol is Webpack's standard mechanism. The first container to `init()` with a scope populates it with shared module references. Subsequent containers calling `init()` with the same scope object discover the already-registered modules and skip loading their own copies.

**webpack.config.js pattern**:
```js
const { shareAll, withModuleFederationPlugin } =
  require('@angular-architects/module-federation/webpack');

const config = withModuleFederationPlugin({
  name: 'mfeAngular14',                              // unique per MFE
  library: { type: 'var', name: 'mfeAngular14' },    // window global
  filename: 'remoteEntry.js',
  exposes: { './bootstrap': './src/main.ts' },
  shared: { ...shareAll({ singleton: true, strictVersion: false, requiredVersion: 'auto' }) },
});
config.output.publicPath = '/mfe/angular14/';         // explicit, not auto
module.exports = config;
```

### Native Federation (Angular 20 MFEs)

Angular 20 MFEs use `@angular-architects/native-federation`, which replaces Webpack Module Federation with ES module import maps.

**How it works**:

1. Each MFE produces a `remoteEntry.json` file listing its exposed modules and shared dependencies with chunk filenames
2. Shared packages across MFEs have deterministic chunk names (`@nf-internal/chunk-*`) — identical packages resolve to identical filenames
3. The shell fetches all `remoteEntry.json` files, builds a deduplicated import map, and injects it

**Shell loading sequence**:

```
1. Fetch remoteEntry.json for each Angular 20 MFE (parallel fetch() calls)
   → Parse JSON manifests listing shared deps and exposed modules

2. Build import map
   → Collect shared packages from all entries
   → Deduplicate: first provider wins (same chunk names across MFEs)
   → Result: { imports: { "@angular/core": "/mfe/angular20/chunk-abc.js", ... } }

3. Inject import map
   → Create <script type="importmap-shim"> with the merged map
   → es-module-shims processes it

4. Load exposed modules
   → importShim(baseUrl + exposed.outFileName) for each MFE
   → ES module bare specifiers (@angular/core, etc.) resolve via import map
   → Bootstrap executes → custom element registered
```

**es-module-shims**: Required because native browser import maps must be present before any ES module loads and cannot be dynamically updated. The `es-module-shims` library provides `importShim()` and `<script type="importmap-shim">` for dynamic injection. It must be configured in **shim mode**:

```html
<script>window.esmsInitOptions = { shimMode: true };</script>
<script async src="https://ga.jspm.io/npm:es-module-shims@1.10.1/dist/es-module-shims.js"></script>
```

**federation.config.js pattern**:
```js
const { withNativeFederation, shareAll } =
  require('@angular-architects/native-federation/config');

module.exports = withNativeFederation({
  name: 'mfe-angular20',
  exposes: { './bootstrap': './src/bootstrap.ts' },
  shared: { ...shareAll({ singleton: true, strictVersion: false, requiredVersion: 'auto' }) },
  skip: ['oxc-parser', '@oxc-parser/binding-win32-x64-msvc',
         '@angular/animations', '@angular/platform-browser/animations'],
});
```

**angular.json structure** (dual-target pattern):
```
build (NF wrapper)
  → builder: @angular-architects/native-federation:build
  → options.target: "mfe-angular20:build-esbuild:production"

build-esbuild (actual Angular builder)
  → builder: @angular/build:application
  → standard Angular build options
```

The NF builder wraps the underlying `@angular/build:application` target, intercepting the output to produce `remoteEntry.json` and shared chunks.

**bootstrap.ts / main.ts split**:
```ts
// main.ts — federation entry point
import { initFederation } from '@angular-architects/native-federation';
initFederation().then(() => import('./bootstrap'));

// bootstrap.ts — actual Angular bootstrap (exposed module)
import { createApplication } from '@angular/platform-browser';
// ... createCustomElement, customElements.define
```

## Component Details

### Shell App

**Technology**: Vanilla HTML/CSS/JS (no build step)

**Responsibilities**:
1. Load Zone.js once from CDN (shared global dependency)
2. Load es-module-shims for Native Federation support
3. Render navigation header
4. Route based on URL hash (`#/angular14`, `#/angular20`, `#/all`)
5. Load MFE bundles on demand via two federation loaders
6. Render MFE custom elements into the container

**Dual Loader Architecture** (`app.js`):

| Loader | Protocol | MFEs | Entry Point |
|--------|----------|------|-------------|
| Module Federation | Webpack shared scope | Angular 14 (A, B, C) | `remoteEntry.js` |
| Native Federation | ES module import maps | Angular 20 (A, B, C) | `remoteEntry.json` |

### Angular 14 MFEs (A, B, C)

| MFE | Custom Element | Theme Color | Container Name |
|-----|---------------|-------------|----------------|
| A | `<mfe-angular14>` | Blue #3498db | `mfeAngular14` |
| B | `<mfe-angular14-b>` | Orange #e67e22 | `mfeAngular14B` |
| C | `<mfe-angular14-c>` | Purple #9b59b6 | `mfeAngular14C` |

**Build tooling**: `ngx-build-plus` with `extraWebpackConfig` pointing to the Module Federation webpack config.

**Bootstrap sequence**:
1. `main.ts` calls `platformBrowserDynamic().bootstrapModule(AppModule)`
2. `AppModule` implements `DoBootstrap` (no `bootstrap` array in `@NgModule`)
3. `ngDoBootstrap()` calls `createCustomElement(MfeComponent, ...)` and registers the custom element
4. The platform and injector remain alive for the lifetime of the page

**Key configuration**:
- `angular.json`: Builder set to `ngx-build-plus:browser`, `outputHashing: "none"`, `extraWebpackConfig: "webpack.config.js"`
- `polyfills.ts`: Zone.js import removed (shell provides it)
- `@types/node` pinned to v16 (newer versions use TypeScript features unsupported by TS 4.7)

### Angular 20 MFEs (A, B, C)

| MFE | Custom Element | Theme Color | Federation Name |
|-----|---------------|-------------|-----------------|
| A | `<mfe-angular20>` | Red #e74c3c | `mfe-angular20` |
| B | `<mfe-angular20-b>` | Green #27ae60 | `mfe-angular20-b` |
| C | `<mfe-angular20-c>` | Teal #1abc9c | `mfe-angular20-c` |

**Build tooling**: `@angular-architects/native-federation:build` wrapping `@angular/build:application`.

**Bootstrap sequence**:
1. `main.ts` calls `initFederation()` then dynamically imports `./bootstrap`
2. `bootstrap.ts` calls `createApplication()` with `provideZoneChangeDetection()` provider
3. The returned `ApplicationRef` injector is used to create the custom element
4. `createCustomElement(MfeComponent, ...)` registers the custom element

**Key configuration**:
- `angular.json`: Dual-target setup (NF wrapper + esbuild builder), `outputHashing: "none"`
- Standalone component (no NgModule)
- `federation.config.js`: `skip` list for Node-only packages (oxc-parser, etc.)

## Zone.js Sharing Strategy

Zone.js monkey-patches browser APIs (setTimeout, Promise, addEventListener, etc.) to enable Angular's change detection. Loading it multiple times causes errors because the patches are applied globally and are not idempotent.

**Solution**: The shell loads Zone.js exactly once via a blocking `<script>` tag in `<head>`. All MFE builds exclude Zone.js from their bundles:

| Layer | Zone.js Handling |
|-------|-----------------|
| Shell `index.html` | `<script src="...zone.umd.min.js">` in `<head>` |
| Angular 14 MFEs | `polyfills.ts`: Zone.js import commented out |
| Angular 20 MFEs | `angular.json`: Empty polyfills array, `provideZoneChangeDetection()` in providers |

## Build Pipeline

Angular 14 and 20 cannot be built with the same Node.js version. The build script (`build.bat`) orchestrates this using nvm:

```
build.bat (8 steps)
  ├── nvm use 16.20.2
  ├── ng build mfe-angular14         (step 1)
  ├── ng build mfe-angular14-b       (step 2)
  ├── ng build mfe-angular14-c       (step 3)
  ├── nvm use 25.6.0
  ├── ng build mfe-angular20         (step 4)
  ├── ng build mfe-angular20-b       (step 5)
  └── ng build mfe-angular20-c       (step 6)
```

**Requires**: Administrator terminal on Windows (nvm symlink requires elevated privileges).

Build outputs:
```
mfe-angular14/dist/mfe-angular14/
  ├── remoteEntry.js        (Module Federation container)
  ├── main.js               (application code, small — shared deps in separate chunks)
  └── src_main_ts.js        (shared Angular 14 framework chunks)

mfe-angular14-b/dist/mfe-angular14-b/
  ├── remoteEntry.js        (container — reuses shared deps from MFE A at runtime)
  └── src_main_ts.js        (app code only, framework already shared)

mfe-angular20/dist/mfe-angular20/browser/
  ├── remoteEntry.json      (Native Federation manifest)
  ├── bootstrap-*.js        (exposed bootstrap module)
  └── @nf-internal/chunk-*  (shared Angular 20 framework chunks)

mfe-angular20-b/dist/mfe-angular20-b/browser/
  ├── remoteEntry.json      (manifest — shared chunks have same names as MFE A)
  ├── bootstrap-*.js        (app-specific bootstrap)
  └── @nf-internal/chunk-*  (identical chunk names → import map deduplicates)
```

## Server Architecture

Express.js serves static files with path mapping:

| URL Path | Filesystem Path |
|----------|----------------|
| `/` | `shell-app/` |
| `/mfe/angular14/*` | `mfe-angular14/dist/mfe-angular14/*` |
| `/mfe/angular14-b/*` | `mfe-angular14-b/dist/mfe-angular14-b/*` |
| `/mfe/angular14-c/*` | `mfe-angular14-c/dist/mfe-angular14-c/*` |
| `/mfe/angular20/*` | `mfe-angular20/dist/mfe-angular20/browser/*` |
| `/mfe/angular20-b/*` | `mfe-angular20-b/dist/mfe-angular20-b/browser/*` |
| `/mfe/angular20-c/*` | `mfe-angular20-c/dist/mfe-angular20-c/browser/*` |

Note the `browser/` subdirectory for Angular 20 — the `@angular/build:application` builder outputs to a `browser/` folder (it also supports SSR output in a `server/` folder).

## Runtime Behavior

### Shared Dependency Loading

**Angular 14 (Module Federation)**:
When all three Angular 14 MFEs load on the `#/angular14` route:
1. Three `remoteEntry.js` scripts are injected (small container stubs)
2. `mfeAngular14.init(sharedScope)` populates the scope with Angular 14 framework modules
3. `mfeAngular14B.init(sharedScope)` and `mfeAngular14C.init(sharedScope)` find existing entries and reuse them
4. The Angular 14 framework code is downloaded and executed **once** — all three MFEs share it

**Angular 20 (Native Federation)**:
When all three Angular 20 MFEs load on the `#/angular20` route:
1. Three `remoteEntry.json` manifests are fetched
2. The shell builds a merged import map — shared packages appear once (first provider wins)
3. The import map is injected as `<script type="importmap-shim">`
4. `importShim()` loads each MFE's bootstrap module
5. Bare specifiers like `@angular/core` resolve through the import map to a single URL
6. The Angular 20 framework code is downloaded **once** — all three MFEs share it

### Bundle Size Impact

Adding additional MFEs incurs minimal additional download size because the framework code is already shared:

| Scenario | Without Federation | With Federation |
|----------|-------------------|-----------------|
| 1 Angular 14 MFE | ~100KB (framework + app) | ~100KB (framework + app) |
| 3 Angular 14 MFEs | ~300KB (3x framework) | ~110KB (1x framework + 3x app) |
| 1 Angular 20 MFE | ~100KB (framework + app) | ~100KB (framework + app) |
| 3 Angular 20 MFEs | ~300KB (3x framework) | ~110KB (1x framework + 3x app) |

Each additional MFE only adds its application-specific code (~5-10KB), not the entire framework.

### Runtime Isolation

Despite sharing framework code, each Angular MFE maintains its own:
1. **Platform instance and injector tree**: Angular's runtime state is scoped, not global
2. **Custom element registration**: Each MFE uses a unique tag name
3. **Change detection**: Independent `ApplicationRef` per MFE
4. **Component tree**: Rendered within its own custom element boundary

The two Angular major versions (14 and 20) remain fully isolated — they share Zone.js but have completely separate framework runtimes.

## Technical Gotchas

| Issue | Cause | Solution |
|-------|-------|----------|
| `import.meta.url` fails in `<script>` | Webpack auto publicPath uses `import.meta.url` which is only valid in ES modules | Set explicit `output.publicPath` in webpack config |
| `export { get, init }` in remoteEntry.js | Default MF library type is `module` | Use `library: { type: 'var', name: '...' }` for window global |
| `container.init()` returns `1` not a Promise | Webpack Module Federation quirk | Wrap with `Promise.resolve(cont.init(scope))` |
| `Failed to resolve module specifier` | es-module-shims not in shim mode | Set `window.esmsInitOptions = { shimMode: true }` before loading |
| `shareAll` bundles Node-only packages | NF's `shareAll` is too aggressive | Add `skip` list in federation.config.js |
| Missing `@oxc-parser/binding-win32-x64-msvc` | Platform-specific native dependency | Install explicitly: `npm install @oxc-parser/binding-win32-x64-msvc` |
| NF builder `Cannot read 'split'` | Missing `target` option pointing to underlying builder | Use dual-target angular.json structure |
| CJS import of `@angular-architects/module-federation` | Main entry is ESM-only | Import from `/webpack` subpath: `require('.../module-federation/webpack')` |

## Extending This Architecture

**Adding a new Angular 14 MFE**: Copy an existing Angular 14 MFE directory, change the Module Federation `name` and `library.name`, update the custom element tag and `publicPath`, add it to `MF_REMOTES` in `app.js`, add a server route, and add the build step to `build.bat`.

**Adding a new Angular 20 MFE**: Copy an existing Angular 20 MFE directory, change the federation `name`, update the custom element tag, add it to `NF_REMOTES` in `app.js`, add a server route, and add the build step to `build.bat`.

**Cross-MFE communication**: Use `CustomEvent` dispatched on `window` or `document`, or implement a lightweight event bus in the shell.

**Production deployment**: Replace the Express server with a CDN or reverse proxy. Each MFE can be deployed independently to its own URL path. Import maps and remote entries can be fetched from different origins.

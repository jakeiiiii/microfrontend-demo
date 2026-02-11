# Microfrontend Demo - Project Instructions

## Build & Run
- Build all MFEs: `build.bat` (requires Admin terminal for nvm)
- Angular 14 MFEs: Node 16.20.2 (`nvm use 16.20.2`)
- Angular 20 MFEs + React MFE: Node 25.6.0 (`nvm use 25.6.0`)
- Start server: `node server.js` → http://localhost:4000

## Project Structure
- 7 MFEs: 3x Angular 14 (Webpack Module Federation), 3x Angular 20 (Native Federation), 1x React (Webpack Module Federation)
- Shell: vanilla JS in `shell-app/` (no build step)
- Full architecture details in `ARCHITECTURE.md`

## Key Conventions
- Angular 14 MFEs use `ngx-build-plus` with `extraWebpackConfig` pointing to `webpack.config.js`
- Angular 20 MFEs use `@angular-architects/native-federation:build` with dual-target angular.json (NF wrapper + build-esbuild)
- Angular MFEs register as custom elements via `@angular/elements`; React MFE registers via `customElements.define()` directly
- Zone.js is loaded once by the shell — Angular MFE builds must exclude it
- React MFE uses a separate `reactSharedScope` in the shell (isolated from Angular's `mfSharedScope`)
- Commit messages should describe the "why", not just the "what"

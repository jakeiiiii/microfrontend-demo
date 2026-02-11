# Microfrontend Demo - Project Instructions

## Build & Run
- Build all MFEs: `build.bat` (requires Admin terminal for nvm)
- Angular 14 MFEs: Node 16.20.2 (`nvm use 16.20.2`)
- Angular 20 MFEs: Node 25.6.0 (`nvm use 25.6.0`)
- Start server: `node server.js` → http://localhost:4000

## Project Structure
- 6 MFEs: 3x Angular 14 (Webpack Module Federation), 3x Angular 20 (Native Federation)
- Shell: vanilla JS in `shell-app/` (no build step)
- Full architecture details in `ARCHITECTURE.md`

## Key Conventions
- Angular 14 MFEs use `ngx-build-plus` with `extraWebpackConfig` pointing to `webpack.config.js`
- Angular 20 MFEs use `@angular-architects/native-federation:build` with dual-target angular.json (NF wrapper + build-esbuild)
- All MFEs register as custom elements via `@angular/elements`
- Zone.js is loaded once by the shell — MFE builds must exclude it
- Commit messages should describe the "why", not just the "what"

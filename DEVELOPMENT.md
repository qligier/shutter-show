# Development Guide

This document contains development setup and common workflows for contributors working on shutter-show.

Prerequisites

- Node.js matching the range declared in package.json: ^20.19.0 || >=22.12.0 (use Node 20 or newer).
- npm (or another JS package manager) — examples below use npm.

Quick setup

1. Install dependencies

```sh
npm install
```

2. Start the dev server

```sh
npm run dev
```

Available npm scripts (from package.json)

- `npm run dev` — Start Vite dev server
- `npm run build` — Run type-check then build (runs `type-check` and `build-only`)
- `npm run build-only` — Build the production bundle with Vite
- `npm run preview` — Serve the production build locally with `vite preview`
- `npm run type-check` — Run `vue-tsc --build` (TypeScript type checking)
- `npm run lint` — Run lint tasks (`lint:oxlint` and `lint:eslint`)
- `npm run lint:oxlint` — Run `oxlint . --fix`
- `npm run lint:eslint` — Run `eslint . --fix --cache`
- `npm run format` — Run `prettier --write --experimental-cli src/`

Editor recommendations

- VS Code + Volar extension for Vue 3 and TypeScript support.
- Install ESLint and Prettier extensions to get linting and formatting in-editor.
- Enable "Format on Save" if you like automated formatting.

Type-checking

To run checks without building:

```sh
npm run type-check
```

Linting and formatting

- Lint everything and attempt to auto-fix:

```sh
npm run lint
```

- Format source files (prettier):

```sh
npm run format
```

Building and preview

- Build for production (also runs type checking):

```sh
npm run build
```

- Serve the built files locally for verification:

```sh
npm run preview
```

Troubleshooting

- If you run into strange TypeScript or dependency issues, try removing `node_modules` and reinstalling:

```sh
rm -rf node_modules package-lock.json && npm install
```

- If lint or build fails, run the respective commands with no `--fix` flags first to inspect raw errors.

Contributing

Please open issues or pull requests. For development setup and running the project locally, follow the instructions in this file.




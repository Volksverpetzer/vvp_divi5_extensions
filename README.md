# VVP Fact-Check Search — DIVI 5 Plugin

A WordPress plugin that adds a custom **Faktencheck-Suche** (Fact-Check Search) module to the DIVI 5 Visual Builder. The module renders an interactive search bar that lets visitors query the Volksverpetzer fact-check archive via a vector-search API.

---

## Table of Contents

1. [What this Plugin Does](#what-this-plugin-does)
2. [Project Structure](#project-structure)
3. [Prerequisites](#prerequisites)
4. [Local Development Setup](#local-development-setup)
5. [Build](#build)
6. [Deployment](#deployment)
7. [Plugin Configuration (in DIVI)](#plugin-configuration-in-divi)
8. [API Contract](#api-contract)
9. [Adapting This for a New DIVI 5 Module](#adapting-this-for-a-new-divi-5-module)
10. [Troubleshooting](#troubleshooting)

---

## What this Plugin Does

When activated in WordPress (with DIVI 5 installed), the plugin registers a new module called **"Faktencheck Suche"** in the DIVI Visual Builder. Editors can place this module on any page. On the front end it renders:

- A persistent blue search bar with a label and call-to-action button.
- A full-screen overlay with an input field, example queries, and a results list.
- Automatic URL detection: if a visitor pastes a URL, the plugin fetches content from an import API before running the search.
- Color-coded relevance scores for each result (green ≥ 70%, yellow ≥ 40%, red < 40%).

All interactivity is handled by a vanilla-JS file (`scripts/fact-check-frontend.js`) that is enqueued after the page loads. The DIVI Visual Builder shows a static React preview (`src/components/fact-check-search/edit.tsx`). The actual front-end HTML is server-rendered by PHP (`modules/FactCheckSearch/FactCheckSearchTrait/RenderCallbackTrait.php`).

---

## Project Structure

```
.
├── .github/workflows/
│   ├── deploy-dev.yml             # CI/CD: dev branch → staging FTP path
│   └── deploy-prod.yml            # CI/CD: main branch → production FTP path
├── modules/                       # PHP backend
│   ├── autoload.php               # PSR-4 class loader
│   ├── Modules.php                # DIVI module registration
│   └── FactCheckSearch/
│       ├── FactCheckSearch.php               # Main module class
│       └── FactCheckSearchTrait/
│           ├── RenderCallbackTrait.php        # Server-side HTML output
│           ├── ModuleClassnamesTrait.php
│           ├── ModuleStylesTrait.php
│           └── ModuleScriptDataTrait.php
├── modules-json/                  # Auto-generated — do not edit manually
│   └── fact-check-search/
│       └── module.json            # Copied from src during build
├── scripts/
│   ├── bundle.js                  # Compiled DIVI VB module JS (webpack output)
│   ├── bundle.js.map
│   └── fact-check-frontend.js     # Vanilla JS for front-end interactivity
├── styles/
│   ├── main.css                   # Compiled CSS (webpack output)
│   └── bundle.css
├── src/                           # TypeScript/React source (DIVI VB only)
│   ├── index.ts                   # Module registration entry point
│   ├── module-icons.ts            # Icon registration
│   └── components/fact-check-search/
│       ├── edit.tsx               # Visual Builder preview component
│       ├── index.ts               # Module export definition
│       ├── module.json            # DIVI module attribute schema
│       ├── types.ts               # TypeScript interfaces
│       ├── constants.ts           # Default API URLs
│       ├── module-classnames.ts
│       ├── module-script-data.tsx
│       ├── styles.tsx
│       ├── placeholder-content.ts
│       ├── style.scss             # Component styles
│       └── module.scss            # Visual Builder styles
├── src/icons/fact-check-search/
│   └── index.tsx                  # Module icon SVG
├── preview/
│   └── vite.config.ts             # Vite dev server for isolated preview
├── vvp-fact-check-search.php      # WordPress plugin entry point
├── composer.json                  # PHP autoloading config
├── package.json                   # Node scripts and dependencies
├── webpack.config.js              # Webpack build configuration
├── tsconfig.json                  # TypeScript configuration
└── gulpfile.js                    # ZIP packaging task
```

---

## Prerequisites

| Tool | Minimum version |
|------|----------------|
| Node.js | 18.x |
| npm | 10.x |
| pnpm | 9.x (used in CI) |
| PHP | 7.4+ |
| Composer | 2.x |
| WordPress | 6.x with DIVI 5 active |

---

## Local Development Setup

### 1. Install PHP dependencies

```bash
composer install
```

This sets up the PSR-4 autoloader for the `VVP\FactCheckSearch\` namespace.

### 2. Install Node dependencies

```bash
npm install
# or with pnpm (matches CI exactly):
pnpm install --frozen-lockfile
```

### 3. Start the Webpack watcher

```bash
npm run start
```

Webpack watches `src/index.ts` and recompiles to `scripts/bundle.js` and `styles/main.css` on every save. Reload WordPress to see updates in the DIVI builder.

### 4. (Optional) Run the isolated preview server

```bash
npm run preview
```

Starts a Vite dev server for the component in isolation (no WordPress needed). Useful for rapid UI iteration on the Visual Builder preview component.

### 5. Symlink or copy the plugin into WordPress

```bash
ln -s /path/to/Divi5Search /path/to/wordpress/wp-content/plugins/vvp-fact-check-search
```

Then activate the plugin in the WordPress admin. DIVI 5 must be active for the module to appear in the builder.

---

## Build

Run a clean production build:

```bash
npm run build
```

Webpack in production mode outputs:

| Output file | Description |
|-------------|-------------|
| `scripts/bundle.js` | Compiled DIVI Visual Builder module |
| `scripts/bundle.js.map` | Source map |
| `styles/main.css` | Compiled component CSS |
| `styles/bundle.css` | Additional compiled CSS |
| `modules-json/fact-check-search/module.json` | Copied module definition |

To create a distributable ZIP for manual WordPress upload:

```bash
npm run zip
```

---

## Deployment

Deployment is automated via GitHub Actions and FTP. Push to the relevant branch and the workflow handles the rest.

### Required GitHub repository secrets

Go to **Settings → Secrets and variables → Actions** and add:

| Secret | Description |
|--------|-------------|
| `FTP_HOST` | FTP server hostname |
| `FTP_USER` | FTP username |
| `FTP_PASSWORD` | FTP password |

### Branch → environment mapping

| Branch | Workflow | Target path on server |
|--------|----------|-----------------------|
| `dev` | `deploy-dev.yml` | `.../wp-content/plugins/vvp-fact-check-search-dev/` |
| `main` | `deploy-prod.yml` | `.../wp-content/plugins/vvp-fact-check-search-prod/` |

### What each workflow does

1. Checks out the repository.
2. Sets up Node 20 with pnpm.
3. Runs `pnpm install --frozen-lockfile`.
4. Runs `npm run build`.
5. Copies the built plugin (excluding `node_modules`, `src/`, dev config files) to `/tmp/deploy`.
6. Mirrors `/tmp/deploy` to the FTP target using `lftp` (remote files not in source are deleted).

The dev workflow also patches the plugin display name to append `(Beta)` before uploading.

### Manual deployment (without CI)

```bash
npm run build

rsync -av \
  --exclude='node_modules' \
  --exclude='src' \
  --exclude='.github' \
  --exclude='preview' \
  --exclude='reference' \
  --exclude='*.config.js' \
  --exclude='gulpfile.js' \
  ./ user@host:/path/to/wp-content/plugins/vvp-fact-check-search/
```

---

## Plugin Configuration (in DIVI)

After activating the plugin, add the **"Faktencheck Suche"** module to any page in the DIVI Visual Builder. The module settings panel exposes:

| Setting | Default value | Description |
|---------|---------------|-------------|
| Such-API URL | `https://ai.volksverpetzer-app.de/api/vector-search/` | POST endpoint for text/vector search queries |
| Import-API URL | `https://ai.volksverpetzer-app.de/api/import-url/` | GET endpoint for URL content import |

These values are injected by PHP into a `<script id="vvp-fact-check-search-config">` tag as JSON and consumed by `fact-check-frontend.js` at runtime. Leaving the fields empty falls back to the defaults defined in `src/components/fact-check-search/constants.ts`.

---

## API Contract

### Search endpoint (POST)

```
POST {searchApiUrl}
Content-Type: application/json

{ "query": "string" }
```

Expected response:

```json
{
  "results": [
    {
      "title": "Artikel-Titel",
      "excerpt": "Kurzbeschreibung des Artikels...",
      "url": "https://example.com/artikel",
      "score": 0.82
    }
  ]
}
```

`score` is a float from 0 to 1. The UI renders it as a percentage bar (green ≥ 70%, yellow ≥ 40%, red < 40%).

### Import endpoint (GET)

```
GET {importApiUrl}?url=<url-encoded-value>
```

Called automatically when the user pastes a URL into the search field. Expected response follows the same shape as the search endpoint.

---

## Adapting This for a New DIVI 5 Module

This plugin is a production-ready scaffold for any custom DIVI 5 module. Follow these steps to repurpose it for a different React component.

### Step 1 — Fork / copy the repository

Start with a fresh copy of this repository and give it a new name matching your plugin slug (e.g. `my-org-my-module`).

### Step 2 — Rename the WordPress plugin

Edit **`vvp-fact-check-search.php`** (rename the file too):

```php
/**
 * Plugin Name: My Custom Module
 * Description: A custom DIVI 5 module for ...
 * Text Domain: my-custom-module
 * Version: 1.0.0
 */

require_once __DIR__ . '/modules/autoload.php';
\MyOrg\MyModule\Modules::init();
```

### Step 3 — Update the PHP namespace

**`composer.json`**:

```json
{
  "autoload": {
    "psr-4": {
      "MyOrg\\MyModule\\": "modules/"
    }
  }
}
```

Run `composer dump-autoload` to regenerate the autoloader.

Rename all PHP files and directories under `modules/` from `FactCheckSearch` to your module name (e.g. `MyModule`). Update the `namespace` and `class` declarations inside each file to match.

**`modules/Modules.php`** — update the `use` statement and the class instantiation to reference your renamed class.

### Step 4 — Create your module component

Copy `src/components/fact-check-search/` to a new folder named after your module slug, e.g. `src/components/my-module/`. Then edit each file:

#### `module.json` — module metadata and settings schema

Change `slug`, `title`, and `icon`. Each key under `attrs` becomes a settings field visible to the editor in the DIVI VB panel:

```json
{
  "title": "My Module",
  "slug": "my-org-my-module",
  "attrs": {
    "myApiUrl": {
      "innerContent": {
        "label": "API URL",
        "description": "The endpoint this module calls.",
        "component": "divi/text"
      }
    }
  }
}
```

Available DIVI attribute components include `divi/text`, `divi/select`, `divi/toggle`, `divi/color-picker`, and others from the DIVI 5 module API.

#### `types.ts` — TypeScript attribute interface

```ts
export interface MyModuleAttrs {
  myApiUrl?: { value: string };
}
```

#### `constants.ts` — default values

```ts
export const DEFAULT_API_URL = 'https://your-api.example.com/endpoint';
```

#### `edit.tsx` — Visual Builder preview

This is the React component shown on the DIVI canvas while editing. Keep it lightweight — use static/mock data, no live API calls:

```tsx
export const MyModuleEdit = ({ attrs }: MyModuleEditProps) => {
  return (
    <ModuleContainer attrs={attrs} ...>
      {/* Your static preview UI */}
    </ModuleContainer>
  );
};
```

#### `style.scss` — component styles

Write the styles for your module here. They are compiled to `styles/main.css` during build.

### Step 5 — Register the new component

**`src/index.ts`** — import and register your module:

```ts
import myModule from './components/my-module';

// Replace the factCheckSearch registration with myModule
```

**`src/module-icons.ts`** — register an icon for your module (reuse the existing one or create a new SVG in `src/icons/my-module/index.tsx`).

### Step 6 — Replace the PHP renderer

`modules/MyModule/MyModuleTrait/RenderCallbackTrait.php` controls the actual HTML delivered to site visitors. Key points:

- Access module attribute values via `$this->props['myAttributeKey']`.
- Add `data-*` attributes to the wrapper element to pass configuration to front-end JS:

```php
$wrapper_attrs = [
    'data-api-url' => esc_attr($myApiUrl),
];
```

- Call `Module::render()` with the DIVI framework at the end of `render_callback()`.

### Step 7 — Replace the front-end JavaScript

`scripts/fact-check-frontend.js` is plain JavaScript (not compiled by Webpack). It is enqueued separately and handles all user interaction after the page loads. Rewrite it for your component's behaviour:

```js
document.querySelectorAll('.my-module-wrapper').forEach(function(wrapper) {
  var apiUrl = wrapper.dataset.apiUrl;
  // your event handlers and API calls here
});
```

This file is not processed by Webpack, so avoid npm imports — keep it self-contained or bundle it separately if needed.

### Step 8 — Update the build and packaging config

**`webpack.config.js`** — the `CopyWebpackPlugin` block automatically copies all `src/components/*/module.json` files to `modules-json/`. No changes needed as long as your component folder is under `src/components/`.

**`gulpfile.js`** — update the ZIP filename if you want `npm run zip` to produce a differently named archive.

### Step 9 — Update the deployment workflows

In `.github/workflows/deploy-dev.yml` and `deploy-prod.yml`, change:

- The FTP target paths to your new plugin directory name.
- The plugin PHP filename references (e.g. `vvp-fact-check-search.php` → `my-custom-module.php`).
- The `sed` command that patches the plugin name for the dev environment.

### Summary: files to change for a new module

| File | What to change |
|------|---------------|
| `vvp-fact-check-search.php` (rename) | Plugin header, namespace call, plugin slug |
| `composer.json` | PSR-4 namespace mapping |
| `modules/` (all PHP, rename dirs) | Namespace, class names, HTML rendering logic |
| `src/index.ts` | Import and register new component |
| `src/module-icons.ts` | Register module icon |
| `src/components/<slug>/module.json` | Module slug, title, settings attributes |
| `src/components/<slug>/index.ts` | Export definition |
| `src/components/<slug>/edit.tsx` | Visual Builder preview React component |
| `src/components/<slug>/types.ts` | Attribute TypeScript interfaces |
| `src/components/<slug>/constants.ts` | Default values |
| `src/components/<slug>/style.scss` | Component styles |
| `scripts/fact-check-frontend.js` | Front-end interactivity (rewrite) |
| `.github/workflows/deploy-*.yml` | FTP paths, plugin filename, name patch |

---

## Troubleshooting

**Module does not appear in the DIVI VB module list**
- Ensure DIVI 5 (not DIVI 4) is active — this plugin uses the DIVI 5 module API, which is not backwards-compatible.
- Run `npm run build` — the `modules-json/` folder must exist and contain the compiled `module.json`.
- Check the PHP error log; a namespace mismatch or autoloader misconfiguration silently prevents registration.

**Styles not loading on the front end**
- Confirm `styles/main.css` was generated by the build.
- Check that the PHP `wp_enqueue_style` calls in `FactCheckSearch.php` reference the correct relative file paths.

**Front-end JS not executing**
- Open the browser console for errors.
- Confirm `scripts/fact-check-frontend.js` is enqueued (check the Network tab).
- Verify the wrapper element has the expected `data-*` attributes in the rendered page source.

**CI deployment fails with FTP errors**
- Confirm all three secrets (`FTP_HOST`, `FTP_USER`, `FTP_PASSWORD`) are set in the GitHub repository settings.
- `lftp` uses `--parallel=5` by default; some hosts block multiple simultaneous FTP connections. Reduce this value in the workflow if you see connection refusals.

**Visual Builder preview is blank**
- Check the browser console inside the DIVI editor for React errors.
- Ensure `edit.tsx` does not make network requests (the VB sandbox may block them).
- Confirm `scripts/bundle.js` was built and is being loaded by the plugin.

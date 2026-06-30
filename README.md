# VVPs Divi5 Extensions for WordPress

A WordPress plugin that adds custom modules to the **DIVI 5 Visual Builder** for Volksverpetzer. Five modules are included:

| Module                | DIVI slug               | Description                                                                   |
| --------------------- | ----------------------- | ----------------------------------------------------------------------------- |
| **Faktencheck Suche** | `vvp/fact-check-search` | Interactive search bar for the fact-check archive                             |
| **Inhaltsübersicht**  | `vvp/content-overview`  | Mixed feed of articles, Instagram posts, YouTube videos, and podcast episodes |
| **Autorenprofil**     | `vvp/author-profile`    | Displays the current post author(s) with avatar, name link, and bio           |
| **Trending Beiträge** | `vvp/trending-items`    | Card grid of trending articles with thumbnails, configurable time range       |
| **Trending Liste**    | `vvp/trending-list`     | Compact list of trending article titles and authors, configurable time range  |

---

## Table of Contents

1. [Modules](#modules)
2. [Project Structure](#project-structure)
3. [Prerequisites](#prerequisites)
4. [Local Development](#local-development)
5. [Build](#build)
6. [Deployment](#deployment)
7. [Plugin Configuration (in DIVI)](#plugin-configuration-in-divi)
8. [API Contract](#api-contract)
9. [Adapting This for a New DIVI 5 Module](#adapting-this-for-a-new-divi-5-module)
10. [Troubleshooting](#troubleshooting)

---

## Modules

### Faktencheck Suche (`vvp/fact-check-search`)

Renders a persistent blue search bar on the front end. Clicking it opens a full-screen overlay with:

- A text/URL input field with example queries
- Automatic URL detection: pastes a URL → content is imported via the Import API before searching
- Results list with color-coded relevance scores (green ≥ 70%, yellow ≥ 40%, red < 40%)
- Keyboard shortcut: Esc to close

**Architecture:**

- PHP server-renders the mount point (`modules/FactCheckSearch/FactCheckSearchTrait/RenderCallbackTrait.php`)
- React app (`src/components/fact-check-search/App.tsx`) is mounted by `scripts/fact-check-frontend.js`
- DIVI Visual Builder preview: `src/components/fact-check-search/edit.tsx`

### Inhaltsübersicht (`vvp/content-overview`)

Renders a mixed content feed fetched server-side from external APIs (RSS, Instagram Graph API, YouTube). The feed contains:

- A hero article + sidebar of recent articles (PHP-rendered)
- An Instagram slideshow carousel (`src/components/content-overview/InstagramSlideshow.tsx`)
- A podcast episode banner with inline audio player (`src/components/content-overview/PodcastBanner.tsx`)
- YouTube video cards (PHP-rendered)

**Architecture:**

- PHP fetches all data and renders the article/video sections (`modules/ContentOverview/ContentOverviewTrait/RenderCallbackTrait.php`)
- React components for Instagram and Podcast are mounted by `scripts/content-overview-frontend.js`
- DIVI Visual Builder preview: `src/components/content-overview/edit.tsx` (skeleton + example cards)

### Autorenprofil (`vvp/author-profile`)

Renders the current post author(s) with optional avatar, bio, and a link to the author page. Author data is read from **PublishPress Authors** (if available) and falls back to WordPress core.

**Settings (DIVI):**

- Profilbild anzeigen (toggle)
- Biografie anzeigen (toggle)
- Link zur Autorenseite (toggle)
- Layout: vertical / horizontal
- Bildbreite (px) (avatar size)
- Name/Bio font controls (DIVI font fields)

**Architecture:**

- PHP server-renders the mount point and injects author data + settings via `data-*` attributes (`modules/AuthorProfile/AuthorProfileTrait/RenderCallbackTrait.php`)
- React app (`src/components/author-profile/App.tsx`) is mounted by `scripts/author-profile-frontend.js`
- DIVI Visual Builder preview: `src/components/author-profile/edit.tsx` (placeholder author data)

### Trending Beiträge (`vvp/trending-items`)

Renders a card grid of the most-read articles within a configurable time range, with optional thumbnails.

**Settings (DIVI):**

- Zeitraum (`range`): time window for trending data (e.g. `last7days`)
- Vorschaubild anzeigen (`showThumbnail`): toggle thumbnail display

**Architecture:**

- PHP fetches trending data and server-renders the module (`modules/TrendingItems/TrendingItemsTrait/RenderCallbackTrait.php`)
- React app (`src/components/trending-items/App.tsx`) is mounted by `scripts/trending-items-frontend.js`
- DIVI Visual Builder preview: `src/components/trending-items/edit.tsx` (placeholder article cards)

### Trending Liste (`vvp/trending-list`)

Renders a compact numbered list of trending article titles and authors within a configurable time range.

**Settings (DIVI):**

- Zeitraum (`range`): time window for trending data (e.g. `last7days`)

**Architecture:**

- PHP fetches trending data and server-renders the module (`modules/TrendingList/TrendingListTrait/RenderCallbackTrait.php`)
- React app (`src/components/trending-list/App.tsx`) is mounted by `scripts/trending-list-frontend.js`
- DIVI Visual Builder preview: `src/components/trending-list/edit.tsx` (placeholder list items)

---

## Project Structure

```
.
├── .github/workflows/
│   ├── ci.yml                     # Lint, type-check, and test on every push
│   ├── deploy-gh-pages.yml        # Publishes Vite preview to GitHub Pages
│   ├── deploy-prerelease.yml      # CI/CD: prerelease branch → staging (SSH/rsync)
│   └── deploy-prod.yml            # CI/CD: main branch → production (SSH/rsync)
├── modules/                       # PHP backend
│   ├── autoload.php               # PSR-4 class loader
│   ├── CronManager.php            # WordPress cron job registration
│   ├── Modules.php                # DIVI module registration
│   ├── FactCheckSearch/
│   │   ├── FactCheckSearch.php
│   │   └── FactCheckSearchTrait/
│   │       ├── RenderCallbackTrait.php    # Server-side HTML (mount point only)
│   │       ├── ModuleClassnamesTrait.php
│   │       ├── ModuleStylesTrait.php
│   │       └── ModuleScriptDataTrait.php
│   ├── ContentOverview/
│   │   ├── ContentOverview.php
│   │   └── ContentOverviewTrait/
│   │       ├── RenderCallbackTrait.php    # Server-side HTML (full feed render)
│   │       ├── ModuleClassnamesTrait.php
│   │       ├── ModuleStylesTrait.php
│   │       └── ModuleScriptDataTrait.php
│   ├── AuthorProfile/
│   │   ├── AuthorProfile.php
│   │   └── AuthorProfileTrait/
│   │       ├── RenderCallbackTrait.php    # Server-side HTML (mount point + author data)
│   │       ├── ModuleClassnamesTrait.php
│   │       ├── ModuleStylesTrait.php
│   │       └── ModuleScriptDataTrait.php
│   ├── TrendingItems/
│   │   ├── TrendingItems.php
│   │   └── TrendingItemsTrait/
│   │       ├── RenderCallbackTrait.php
│   │       ├── ModuleClassnamesTrait.php
│   │       ├── ModuleStylesTrait.php
│   │       └── ModuleScriptDataTrait.php
│   └── TrendingList/
│       ├── TrendingList.php
│       └── TrendingListTrait/
│           ├── RenderCallbackTrait.php
│           ├── ModuleClassnamesTrait.php
│           ├── ModuleStylesTrait.php
│           └── ModuleScriptDataTrait.php
├── modules-json/                  # Auto-generated — do not edit
│   ├── fact-check-search/module.json
│   ├── content-overview/module.json
│   ├── author-profile/module.json
│   ├── trending-items/module.json
│   └── trending-list/module.json
├── scripts/                       # Compiled JS (Vite output)
│   ├── bundle.js                  # DIVI Visual Builder module
│   ├── fact-check-frontend.js     # Mounts FactCheckSearchApp
│   ├── content-overview-frontend.js  # Mounts InstagramSlideshow + PodcastBanner
│   ├── author-profile-frontend.js # Mounts AuthorProfileApp
│   ├── trending-items-frontend.js # Mounts TrendingItemsApp
│   └── trending-list-frontend.js  # Mounts TrendingListApp
├── styles/                        # Compiled CSS (Vite output)
│   └── main.css
├── src/                           # TypeScript/React source
│   ├── index.ts                   # Registers all modules with DIVI
│   ├── module-icons.ts            # Icon registration
│   ├── components/
│   │   ├── shared/
│   │   │   └── ArticleCard.tsx    # Shared article card component
│   │   ├── fact-check-search/
│   │   │   ├── module.json        # DIVI attribute schema
│   │   │   ├── App.tsx            # Standalone React search UI
│   │   │   ├── edit.tsx           # DIVI VB preview component
│   │   │   ├── frontend.tsx       # Vite entry: mounts App.tsx
│   │   │   ├── index.ts
│   │   │   ├── icons.tsx          # Inline SVG icons
│   │   │   ├── types.ts
│   │   │   ├── constants.ts       # Default API URLs
│   │   │   ├── placeholder-content.ts
│   │   │   ├── styles.tsx
│   │   │   ├── module-classnames.ts
│   │   │   ├── module-script-data.tsx
│   │   │   ├── style.scss         # Frontend styles
│   │   │   └── module.scss        # VB editor styles
│   │   ├── content-overview/
│   │   │   ├── module.json
│   │   │   ├── edit.tsx           # DIVI VB preview (skeleton + example cards)
│   │   │   ├── frontend.tsx       # Vite entry: mounts IG + Podcast
│   │   │   ├── index.ts
│   │   │   ├── ArticleCard.tsx
│   │   │   ├── InstagramSlideshow.tsx  # Carousel with fullscreen overlay
│   │   │   ├── PodcastBanner.tsx       # Audio player banner
│   │   │   ├── YouTubeBanner.tsx
│   │   │   ├── types.ts
│   │   │   ├── placeholder-content.ts
│   │   │   ├── styles.tsx
│   │   │   ├── module-classnames.ts
│   │   │   ├── module-script-data.tsx
│   │   │   ├── style.scss
│   │   │   └── module.scss
│   │   ├── author-profile/
│   │   │   ├── module.json        # DIVI attribute schema
│   │   │   ├── App.tsx            # Standalone React author UI
│   │   │   ├── edit.tsx           # DIVI VB preview component
│   │   │   ├── frontend.tsx       # Vite entry: mounts App.tsx
│   │   │   ├── index.ts
│   │   │   ├── types.ts
│   │   │   ├── placeholder-content.ts
│   │   │   ├── styles.tsx
│   │   │   ├── module-classnames.ts
│   │   │   ├── module-script-data.tsx
│   │   │   ├── style.scss         # Frontend styles
│   │   │   └── module.scss        # VB editor styles
│   │   ├── trending-items/
│   │   │   ├── module.json
│   │   │   ├── App.tsx
│   │   │   ├── edit.tsx
│   │   │   ├── frontend.tsx
│   │   │   ├── index.ts
│   │   │   ├── types.ts
│   │   │   ├── placeholder-content.ts
│   │   │   ├── styles.tsx
│   │   │   ├── module-classnames.ts
│   │   │   ├── module-script-data.tsx
│   │   │   ├── style.scss
│   │   │   └── module.scss
│   │   └── trending-list/
│   │       ├── module.json
│   │       ├── App.tsx
│   │       ├── edit.tsx
│   │       ├── frontend.tsx
│   │       ├── index.ts
│   │       ├── types.ts
│   │       ├── placeholder-content.ts
│   │       ├── styles.tsx
│   │       ├── module-classnames.ts
│   │       ├── module-script-data.tsx
│   │       ├── style.scss
│   │       └── module.scss
│   └── icons/
│       ├── fact-check-search/index.tsx
│       ├── content-overview/index.tsx
│       ├── author-profile/index.tsx
│       ├── trending-items/index.tsx
│       └── trending-list/index.tsx
├── preview/                       # Vite component preview (no WordPress needed)
│   ├── index.html
│   └── main.tsx                   # Renders all standalone React components
├── build.mjs                      # Vite build script (VB bundle + frontend bundles)
├── vite.config.ts                 # Vite config for pnpm preview (port 8899)
├── vvp-divi5-extensions.php       # WordPress plugin entry point
├── dev-preview.php                # PHP preview server (all modules, no WP needed)
├── composer.json
├── package.json
├── pnpm-workspace.yaml
├── tsconfig.json
├── vitest.config.ts
├── eslint.config.mjs
├── cspell.config.json
├── lint-staged.config.ts
└── zip.mjs                        # ZIP packaging
```

---

## Prerequisites

| Tool      | Minimum version                    |
| --------- | ---------------------------------- |
| Node.js   | 22.x                               |
| pnpm      | 11.x                               |
| PHP       | 7.4+                               |
| Composer  | 2.x                                |
| WordPress | 6.x with DIVI 5 active             |
| zip       | any (pre-installed on macOS/Linux) |

---

## Local Development

### 1. Install PHP dependencies

```bash
composer install
```

Sets up the PSR-4 autoloader for `VVP\Divi5\`.

### 2. Install Node dependencies

```bash
pnpm install --frozen-lockfile
```

### 3. Start the dev server

```bash
pnpm start
```

Watches `src/` and recompiles `scripts/bundle.js`, `scripts/fact-check-frontend.js`, `scripts/content-overview-frontend.js`, `scripts/author-profile-frontend.js`, `scripts/trending-items-frontend.js`, `scripts/trending-list-frontend.js`, and `styles/main.css` on every save.

### 4. Vite component preview (no WordPress needed)

```bash
pnpm preview
```

Starts a Vite dev server at **http://localhost:8899** that renders:

- **FactCheckSearch** — fully interactive (live API calls to the configured endpoints)
- **AuthorProfile** — standalone preview with sample author data + layout variants
- **InstagramSlideshow** — carousel with fullscreen overlay, sample placeholder images
- **PodcastBanner** — audio player banner
- **TrendingItems** — card grid with placeholder articles
- **TrendingList** — compact list with placeholder items

This is the fast iteration loop for the standalone React components. Vite provides HMR — edits to component files and SCSS files reflect instantly without a full reload.

### 5. PHP preview server (all modules, no WordPress needed)

```bash
php -S localhost:8787 dev-preview.php
```

Renders the full `ContentOverview` HTML output as PHP would on the front end, including live API calls for articles, Instagram, YouTube, and podcast data. Cache is stored in `/tmp/vvp_co_preview_*.cache` and can be flushed via `?flush=1`.

### 6. Symlink into WordPress

```bash
ln -s /path/to/vvp_divi5_extensions /path/to/wordpress/wp-content/plugins/vvp-divi5-extensions
```

Then activate the plugin in the WordPress admin.

---

## Build

```bash
pnpm build
```

Vite in production mode outputs:

| File                                   | Description                                                 |
| -------------------------------------- | ----------------------------------------------------------- |
| `scripts/bundle.js`                    | DIVI Visual Builder module (externals: React, DIVI globals) |
| `scripts/fact-check-frontend.js`       | FactCheckSearch frontend bundle (standalone)                |
| `scripts/content-overview-frontend.js` | ContentOverview frontend bundle (standalone)                |
| `scripts/author-profile-frontend.js`   | AuthorProfile frontend bundle (standalone)                  |
| `scripts/trending-items-frontend.js`   | TrendingItems frontend bundle (standalone)                  |
| `scripts/trending-list-frontend.js`    | TrendingList frontend bundle (standalone)                   |
| `styles/main.css`                      | All component CSS                                           |
| `modules-json/*/module.json`           | Copied module schemas                                       |

To produce a distributable ZIP:

```bash
pnpm zip
```

---

## Deployment

Deployment is automated via GitHub Actions and SSH/rsync. Push to the relevant branch.

### Required GitHub secrets

| Secret           | Description                         |
| ---------------- | ----------------------------------- |
| `SSH_DEPLOY_KEY` | Private SSH key for the deploy user |
| `SSH_HOST_KEY`   | Host key entry for `known_hosts`    |
| `SSH_USER`       | SSH username on the target server   |
| `SSH_HOST`       | Target server hostname              |

### Branch → environment

| Branch       | Target path                                         |
| ------------ | --------------------------------------------------- |
| `prerelease` | `.../wp-content/plugins/vvp-divi5-extensions-dev/`  |
| `main`       | `.../wp-content/plugins/vvp-divi5-extensions-prod/` |

Each workflow: checks out → installs pnpm deps → builds → mirrors to the server via rsync (excluding `node_modules`, `src/`, dev configs). The `prerelease` workflow patches the plugin display name to append `(Beta)` and appends the commit SHA to the version number.

### Manual deployment

```bash
pnpm build

rsync -av \
  --exclude='node_modules' \
  --exclude='src' \
  --exclude='preview' \
  --exclude='.github' \
  --exclude='reference' \
  --exclude='vite.config.ts' \
  --exclude='build.mjs' \
  --exclude='zip.mjs' \
  ./ user@host:/path/to/wp-content/plugins/vvp-divi5-extensions/
```

---

## Plugin Configuration (in DIVI)

### Faktencheck Suche

| Setting        | Default                                               | Description                         |
| -------------- | ----------------------------------------------------- | ----------------------------------- |
| Such-API URL   | `https://ai.volksverpetzer-app.de/api/vector-search/` | POST endpoint for search queries    |
| Import-API URL | `https://ai.volksverpetzer-app.de/api/import-url/`    | GET endpoint for URL content import |

Values are injected by PHP as JSON into a `<script id="vvp-fact-check-search-config">` tag and consumed by the frontend bundle.

### Inhaltsübersicht

Configured via `modules/ContentOverview/ContentOverviewTrait/RenderCallbackTrait.php` (API endpoints, feed sizes, cache TTL). No DIVI settings panel fields — all configuration is in PHP constants.

### Autorenprofil

The module reads the author(s) for the current context (PublishPress Authors if available) and renders the UI via `scripts/author-profile-frontend.js`. The DIVI settings control the visible parts (avatar/bio/link), layout, avatar size, and font styles.

### Trending Beiträge / Trending Liste

Both modules read trending data from the WordPress database (populated by `modules/CronManager.php`). The DIVI settings expose a time-range selector (`range`). TrendingItems additionally has a thumbnail toggle.

---

## API Contract

### Search endpoint (POST)

```
POST {searchApiUrl}
Content-Type: application/json

{ "query": "string" }
```

Response:

```json
{
  "results": [
    {
      "title": "Artikel-Titel",
      "excerpt": "Kurzbeschreibung...",
      "url": "https://example.com/artikel",
      "score": 0.82,
      "rerank_score": 0.91
    }
  ],
  "took": 120
}
```

`score` / `rerank_score`: float 0–1, rendered as percentage bar. `took`: milliseconds.

### Import endpoint (GET)

```
GET {importApiUrl}?url=<url-encoded-value>
```

Called when the user pastes a URL. Returns an object with a `snippet` field (extracted text) that is then passed to the search endpoint.

---

## Adapting This for a New DIVI 5 Module

This plugin is a production-ready scaffold. To add a new module:

### Step 1 — Create the PHP module

Copy `modules/FactCheckSearch/` to `modules/YourModule/`. Rename all files, class names, and namespace segments. Register it in `modules/Modules.php`.

`RenderCallbackTrait.php` controls the front-end HTML. Access attribute values via `$this->props['attributeKey']` and pass config to JS via `data-*` attributes on the wrapper element.

### Step 2 — Create the TypeScript component

Copy `src/components/fact-check-search/` to `src/components/your-module/`. Update:

| File           | What to change                                         |
| -------------- | ------------------------------------------------------ |
| `module.json`  | `slug`, `title`, `attrs` (settings schema)             |
| `types.ts`     | Attribute interface                                    |
| `constants.ts` | Default values                                         |
| `edit.tsx`     | DIVI VB preview React component (static, no API calls) |
| `frontend.tsx` | Vite entry: mounts your React app                      |
| `style.scss`   | Component CSS                                          |

Available DIVI attribute components: `divi/text`, `divi/select`, `divi/toggle`, `divi/color-picker`.

### Step 3 — Register the module

**`src/index.ts`** — import and register with `addAction` / `registerModule`.

**`src/module-icons.ts`** — register the module icon.

### Step 4 — Add a build entry

In `build.mjs`, add a new Vite config entry for your frontend bundle (following the `fact-check-frontend` pattern).

### Step 5 — Enqueue in WordPress

In `vvp-divi5-extensions.php`, add `wp_enqueue_script` / `wp_enqueue_style` calls for your new frontend bundle.

### Step 6 — Add to the Vite preview

In `preview/main.tsx`, import your standalone React component and add a `<Section>` for it.

### Step 7 — Update CI/CD

Update the `deploy-prerelease.yml` workflow if any new build artifacts need to be copied to the deploy directory.

---

## Troubleshooting

**Module does not appear in the DIVI VB module list**

- DIVI 5 (not DIVI 4) must be active — the APIs are not backwards-compatible.
- Run `pnpm build` — `modules-json/` must exist with compiled `module.json` files.
- Check the PHP error log for namespace or autoloader errors.

**Styles not loading**

- Confirm `styles/main.css` was generated by the build.
- Check `wp_enqueue_style` paths in `vvp-divi5-extensions.php`.

**Front-end JS not running**

- Check the browser console for errors.
- Confirm the script is enqueued (Network tab).
- Verify the wrapper element has the expected `data-*` attributes in the page source.

**pnpm preview fails to start**

- Run `pnpm install` first — `vite` and `@vitejs/plugin-react` must be installed.
- Port 8899 must be free.

**PHP preview shows no data**

- `curl` extension must be available: `php -r "echo extension_loaded('curl') ? 'ok' : 'missing';"`.
- Clear the transient cache: visit `http://localhost:8787/?flush=1` in the browser, or run `php dev-preview.php --flush` from the CLI.

**ContentOverview feed is stale, empty, or not updating**

The `Inhaltsübersicht` module never fetches external APIs during a page render — renders only read cached data. A WP-Cron event (`vvp_warm_content_overview_cache`, every 25 min) refreshes that cache out-of-band. This decoupling fixed a production cache-stampede outage; see [PR #74](https://github.com/Volksverpetzer/vvp_divi5_extensions/pull/74) for the full background.

So if the feed stops updating, the cache warmer has stopped running. Glance at it occasionally:

```bash
wp cron event list --allow-root | grep vvp_warm_content_overview_cache
```

The "next run" should always be ≤25 minutes out. If it has drifted well past that, WP-Cron isn't firing. On production WP-Cron is driven by a **system cron** (`DISABLE_WP_CRON` is `true`), so verify the daemon and the job log:

```bash
systemctl is-active cron
tail /var/log/vvp-wp-cron.log
```

Manually warm the cache to recover immediately:

```bash
wp cron event run vvp_warm_content_overview_cache --allow-root
```

**CI deployment errors**

- Confirm all four SSH secrets (`SSH_DEPLOY_KEY`, `SSH_HOST_KEY`, `SSH_USER`, `SSH_HOST`) are set in GitHub repository settings.
- Check the rsync output in the Actions log for permission or connectivity issues.

# "Link teilen" Divi Module Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A general Divi 5 module `vvp/share-link` that shows a title, text and link, with a QR code on desktop and the system share sheet on phones.

**Architecture:** Same shape as the CTA-Box module: `module.json` fields, a PHP render callback that writes a mount `<div>` with data attributes, a React frontend that hydrates it, and an edit renderer that uses the same React `ShareLinkApp` in the Visual Builder. The QR is drawn client-side as SVG with `uqr`.

**Tech Stack:** Divi 5 module API (PHP + `@divi/module`), React 19 (frontend) / vendor React (VB), `uqr`, `@volksverpetzer/ui-web` Button, vitest + react-dom/server, Storybook.

**Spec:** `docs/superpowers/specs/2026-11-27-share-link-module-design.md`

## Global Constraints

- Branch `feat/share-link-module` off `prerelease`; PR to `prerelease`. Never commit to `prerelease`/`main`.
- Only `http://` / `https://` URLs reach the link, the copy and the QR code (`^https?://`). Anything else falls back to the current page's permalink.
- No third-party requests: QR generated locally (`uqr`), no external share widgets.
- German UI copy, defaults exactly: Titel „Teile die Aktion!“, QR-Beschriftung „Scan mit dem Handy“, buttons „Teilen“ and „Link kopieren“, success „Link kopiert!“ (2 s), error „Konnte Link nicht kopieren.“
- QR hidden on `(pointer: coarse)` via CSS only (no JS device detection, no layout shift).
- Plausible events via `src/utils/plausible.ts` `trackEvent`: `Link Shared` `{ method: "native-share", url }`, `Link Copied` `{ location: "share", url }` (same as the crowdfunding app, decided 2026-11-27). No events in the Visual Builder or Storybook.
- New dependency `uqr` (MIT, no deps); pnpm's 24h `minimumReleaseAge` applies (0.1.3 is old enough).
- `pnpm check` (cspell + tsc), `pnpm lint`, `pnpm test run`, `pnpm build` must pass.

## Review Focus

1. **Relative or junk link field** (`/weihnachten/`, `javascript:alert(1)`, `www.example.de`): `/…` paths resolve against `home_url()`; everything else not matching `^https?://` falls back to the permalink. Test in Task 1 (`safeShareUrl`) and Task 3 (PHP, by manual check).
2. **Clipboard unavailable** (insecure context, permission denied, `navigator.clipboard` undefined): shows „Konnte Link nicht kopieren.“, no throw. Test in Task 2.
3. **Share sheet cancelled or failing** (`navigator.share` rejects with `AbortError` or anything else): nothing shown, no event tracked, no throw. Test in Task 2.
4. **Very long URL**: the visible URL truncates with an ellipsis (CSS), while copy/share/QR use the full URL. Test in Task 2 (full URL in `href`/copy).
5. **HTML or quotes in title/text** (`<b>Hi</b> "x"`): shown as plain text (PHP `esc_attr`, React escaping). Test in Task 2.

---

### Task 1: URL helpers and QR rendering

**Files:**

- Create: `src/components/share-link/share-url.ts`
- Test: `src/components/share-link/share-url.test.ts`
- Modify: `package.json`, `pnpm-lock.yaml` (add `uqr`)

**Interfaces:**

- Produces:
  - `safeShareUrl(raw: string, fallback: string): string`: trimmed `raw` if it matches `/^https?:\/\//i`, else `fallback`.
  - `displayUrl(url: string): string`: drops the scheme and one trailing `/`.
  - `qrSvg(url: string): string`: SVG markup from `uqr`'s `renderSVG(url, { ecc: "M", border: 2 })`.

- [ ] **Step 1: Add the dependency:** `pnpm add uqr@0.1.3`.
- [ ] **Step 2: Write the failing tests**

```ts
import { safeShareUrl, displayUrl, qrSvg } from "./share-url";

const FB = "https://volksverpetzer.de/weihnachten/";

describe("safeShareUrl", () => {
  it("keeps http(s) URLs", () => {
    expect(safeShareUrl(" https://volksverpetzer.de/x/ ", FB)).toBe(
      "https://volksverpetzer.de/x/",
    );
    expect(safeShareUrl("HTTP://example.de", FB)).toBe("HTTP://example.de");
  });
  it.each([
    "",
    "javascript:alert(1)",
    "www.example.de",
    "/weihnachten/",
    "data:text/html,x",
  ])("falls back for %j", (raw) => expect(safeShareUrl(raw, FB)).toBe(FB));
});

describe("displayUrl", () => {
  it("drops scheme and trailing slash", () => {
    expect(displayUrl("https://volksverpetzer.de/weihnachten/")).toBe(
      "volksverpetzer.de/weihnachten",
    );
  });
});

describe("qrSvg", () => {
  it("returns an svg", () => {
    const svg = qrSvg(FB);
    expect(svg.startsWith("<svg")).toBe(true);
    expect(svg).not.toContain("<script");
  });
});
```

- [ ] **Step 3: Run:** `pnpm test run src/components/share-link/share-url.test.ts`. Expected: FAIL (module not found).
- [ ] **Step 4: Implement the three functions** in `share-url.ts`.
- [ ] **Step 5: Run the same command.** Expected: PASS.
- [ ] **Step 6: Commit:** `git add package.json pnpm-lock.yaml src/components/share-link/share-url*.ts && git commit -m "feat(share-link): URL helpers and QR rendering"`

### Task 2: `ShareLinkApp` component

**Files:**

- Create: `src/components/share-link/App.tsx`, `src/components/share-link/style.css`
- Test: `src/components/share-link/App.test.tsx`
- Create: `src/components/share-link/App.stories.tsx` (default, long URL, no text)

**Interfaces:**

- Consumes: `displayUrl`, `qrSvg` (Task 1); `trackEvent` from `src/utils/plausible.ts`.
- Produces: `ShareLinkApp(props: { title: string; text: string; url: string; qrLabel: string; track?: boolean }): ReactElement`. `url` is already safe (callers run `safeShareUrl`). `track` defaults to `true`; edit/stories pass `false`.

Markup (class names fixed, BEM under `vvp-share-link`): root `.vvp-share-link`. `.vvp-share-link__qr` holds the SVG via `dangerouslySetInnerHTML` (from `qrSvg` only) plus the `.vvp-share-link__qr-label` text. `.vvp-share-link__body` holds `h3.vvp-share-link__title` and `p.vvp-share-link__text` (omitted when empty), `a.vvp-share-link__url` (`href={url}`, text `displayUrl(url)`, `title={url}`), and `.vvp-share-link__actions` with the ui-web `Button`s „Teilen“ (rendered only when `typeof navigator.share === "function"`, checked after mount so SSR markup has no share button) and „Link kopieren“. Status text lives in a `p.vvp-share-link__status` with `aria-live="polite"`.

`style.css`: two columns (QR left) on wide screens; `@media (pointer: coarse) { .vvp-share-link__qr { display: none } }`; `.vvp-share-link__url` gets `overflow: hidden; text-overflow: ellipsis; white-space: nowrap`. Under `(pointer: coarse)`, the „Teilen“ button gets the primary variant, otherwise „Link kopieren“ (both rendered, swap via CSS `order` and a modifier class; the builder picks the exact mechanism).

- [ ] **Step 1: Write the failing tests** (jsdom; render with `createRoot` + `act` like `src/components/shared/ArticleCard.test.tsx`; stub `navigator.share` / `navigator.clipboard` / `window.plausible` per test):
  - `renders title, text and url as plain text`: title `<b>Hi</b> "x"` appears escaped (`&lt;b&gt;`), `a.vvp-share-link__url` has `href` = full URL and text `volksverpetzer.de/weihnachten`.
  - `contains the QR svg`: `.vvp-share-link__qr svg` exists.
  - `hides Teilen without navigator.share`: no button with text „Teilen“.
  - `shares via navigator.share`: called with `{ title, text, url }`; `plausible` called with `"Link Shared", { props: { method: "native-share", url } }`.
  - `cancelled share is silent`: `navigator.share` rejects `new DOMException("", "AbortError")`, so no status text and no `Link Shared` event.
  - `copies the link`: `clipboard.writeText` called with the full URL; status „Link kopiert!“; `Link Copied` tracked with `{ location: "share-link", url }`; after `vi.advanceTimersByTime(2000)` the status is empty.
  - `copy failure shows an error`: `navigator.clipboard` undefined, so status „Konnte Link nicht kopieren.“
  - `track={false} sends no events`.
- [ ] **Step 2: Run:** `pnpm test run src/components/share-link/App.test.tsx`. Expected: FAIL.
- [ ] **Step 3: Implement `ShareLinkApp`, `style.css` and the stories.**
- [ ] **Step 4: Run the same command.** Expected: PASS.
- [ ] **Step 5: Commit:** `feat(share-link): ShareLinkApp component`

### Task 3: Divi module wiring (VB + frontend + PHP)

**Files** (copy the CTA-Box counterparts and adapt; names from `cta-box` → `share-link`, `CtaBox` → `ShareLink`, `ctaBox` → `shareLink`):

- Create: `src/components/share-link/{module.json,types.ts,constants.ts,placeholder-content.ts,edit.tsx,frontend.tsx,index.ts,module-classnames.ts,module-script-data.tsx,styles.tsx,module.css}`
- Create: `src/icons/share-link/` (icon like `src/icons/cta-box`, a share/QR glyph); register in `src/module-icons.ts`
- Modify: `src/index.ts` (import + `addAction(... "vvp/shareLink" ...)`), `build.mjs` (`frontends` entry `share-link-frontend`)
- Create: `modules/ShareLink/ShareLink.php`, `modules/ShareLink/ShareLinkTrait/{RenderCallbackTrait,ModuleClassnamesTrait,ModuleStylesTrait,ModuleScriptDataTrait}.php`
- Modify: `modules/Modules.php` (use + `add_dependency(new ShareLink())`), `vvp-divi5-extensions.php` (VB `register_package_build` `vvp-share-link-frontend-vb` and frontend `wp_enqueue_script('vvp-share-link-frontend', …)`, same pattern as `cta-box`)

**Interfaces:**

- Consumes: `ShareLinkApp` (Task 2), `safeShareUrl` (Task 1).
- `module.json`: `name` `vvp/share-link`, `title` „Link teilen“, `titles` „Links teilen“, `moduleClassName`/`moduleOrderClassName` `share_link`. Fields (all `<name>.innerContent`, group `mainContent`): `title` (divi/text, „Titel“, default „Teile die Aktion!“), `text` (divi/textarea, „Text“), `url` (divi/text, „Link (optional)“, description „Leer lassen für die aktuelle Seite. Nur http(s)-Links oder Pfade wie /weihnachten/.“), `qrLabel` (divi/text, „QR-Beschriftung“, default „Scan mit dem Handy“).
- PHP `render_callback`: read the four values like CtaBox (`$attrs[<name>]['innerContent']['desktop']['value']`). Resolve the link: empty, so `get_permalink()`; starts with `/` (not `//`), so `home_url($path)`; then if not `^https?://`i, `get_permalink()`. Mount `div.vvp-share-link__mount` with `data-title`, `data-text`, `data-qr-label` (`esc_attr`) and `data-url` (`esc_url`).
- `frontend.tsx`: like CtaBox's `initAll` (selector `.vvp-share-link__mount:not([data-share-link-initialized="true"])`), passing `safeShareUrl(data-url, location.origin + location.pathname)`.
- `edit.tsx`: same attrs; URL fallback `window.location.origin + window.location.pathname` (the VB app window shows the page itself; the pathname drops `?et_fb=1`); `track={false}`.

- [ ] **Step 1: Create the files above.**
- [ ] **Step 2: Run** `pnpm check && pnpm lint && pnpm test run && pnpm build`. Expected: all pass; `scripts/share-link-frontend.js` and `modules-json/share-link/module.json` exist.
- [ ] **Step 3: Check manually** in the local WP/Divi (or `dev-preview.php` if it covers modules): the module appears as „Link teilen“, the editor preview shows QR + texts, an empty link uses the page URL, `/weihnachten/` becomes `https://<host>/weihnachten/`, and `javascript:x` falls back to the permalink.
- [ ] **Step 4: Commit:** `feat(share-link): register Divi module "Link teilen"`

### Task 4: Changelog and PR

**Files:**

- Modify: `CHANGELOG.md` (under `[Unreleased]` → `### Added`)

- [ ] **Step 1: Add an entry** describing the module in the changelog's style (German UI names, what it does on desktop vs phone, the Plausible events, that the QR is generated locally).
- [ ] **Step 2: Run** `pnpm check` (cspell catches new German words; add real words to `cspell.config.json` if needed).
- [ ] **Step 3: Commit, push, open the PR** against `prerelease` with the design doc and plan linked and the manual check results listed.

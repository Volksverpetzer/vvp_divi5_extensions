# Divi module "Link teilen" (vvp/share-link): design

Status: draft, 2026-11-27

## Intent

Design asked how /weihnachten can be shared. We want one general Divi 5
module that can go on any page (campaign pages first, later any page).
It shows a title, a short text and the link, and helps people share it:

- **Desktop visitors** usually want the page on their phone. A QR code
  they scan does that.
- **Phone visitors** use the system share sheet (WhatsApp, Signal,
  AirDrop …). On phones the QR code adds nothing.

## Goals

- Title, text, visible URL, "Link kopieren" on every device.
- Phone: one prominent "Teilen" button that opens the share sheet
  (`navigator.share`). No QR code.
- Desktop: QR code as the centrepiece with a short label ("Scan mit dem
  Handy"). "Link kopieren" is the main button. The share button appears
  only where the browser supports `navigator.share` (e.g. Safari on Mac).
- The URL is set in the module and defaults to the current page.
- The Divi editor preview looks like the live page.

## Non-goals

- Print and downloadable QR codes (decided 2026-11-27: not needed for now).
- Campaign/UTM parameters on the shared link.
- Buttons for individual social networks.

## Anti-goals

- No third-party service may learn which page is viewed (no external QR
  API, no share widgets that load from other hosts).
- No arbitrary URL schemes in the link or the QR code (`javascript:` etc.).

## Approaches

1. **QR in the browser with a small JS library (chosen).** The React
   frontend draws the QR as SVG with `uqr` (MIT, no dependencies, outputs
   SVG; 0.1.3, published long before the 24h release-age window). Editor
   preview and live page share one implementation. Cost: a few KB of JS;
   the QR appears once the script runs (desktop only, acceptable).
2. QR on the server in PHP (`chillerlan/php-qrcode`): QR in the HTML
   without JS, but the React editor preview would need a second
   generator or an extra request, plus a new Composer dependency.
3. External QR API: nothing to install, but leaks page views to a third
   party. Ruled out (anti-goal).

The user picked 1 on 2026-11-27.

## Design

Follows the existing modules (e.g. `src/components/cta-box/`,
`modules/CtaBox/`): `module.json` fields, a PHP render callback that
passes data attributes, a React frontend that hydrates them, an edit
component for the Divi editor, a Storybook story and vitest tests.

**Editor fields** (German labels, defaults in brackets):

- Titel ["Teile die Aktion!"]
- Text [empty]
- Link (optional) [empty = permalink of the current page, resolved in
  PHP with `get_permalink()`, so it has no query string]
- QR-Beschriftung ["Scan mit dem Handy"]

**Behaviour:**

- Device split by the media query `(pointer: coarse)`: the QR code is
  hidden on touch devices (phones, tablets) via CSS, so there is no
  layout shift; the "Teilen" button is the primary action there.
- "Teilen" calls `navigator.share({ title, text, url })`; cancelling
  the sheet does nothing. Hidden where `navigator.share` is missing.
- "Link kopieren" uses `navigator.clipboard.writeText` and shows
  "Link kopiert!" for 2 s; on failure "Konnte Link nicht kopieren."
- The visible URL is shown without `https://`, truncated with an
  ellipsis if too long, and is a normal link.
- URLs are accepted only if they match `^https?://` (absolute, after
  PHP resolves the default). A path like `/weihnachten/` is resolved
  against the site URL first (my call, so a relative link isn't silently
  ignored). Anything else falls back to the current page's permalink.
- Plausible events via `src/utils/plausible.ts`: "Link Shared"
  (method: native-share) and "Link Copied", with the URL, matching the
  crowdfunding app's SharePrompt.

**Styling:** design-system tokens and `@volksverpetzer/ui-web` buttons,
like the other modules. Exact spacing and colours are for design to
adjust in Divi.

## Left to the builder

- File layout and naming within the existing module conventions.
- QR size, quiet zone and error-correction level (must scan reliably
  from a laptop screen; default to medium error correction).
- Story variants and test cases.

## Rollout

Branch `feat/share-link-module` off `prerelease`, PR to `prerelease`,
then the usual release to `main`. Not needed for the 2026-11-29 launch:
/weihnachten can use a Code module snippet until then.

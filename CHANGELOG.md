# Changelog

All notable changes to the Volksverpetzer DIVI 5 extensions are documented here.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2026-08-04

### Added

- Campaign Donate and Campaign Progress: Stripe redirect-based payments (3D Secure, Klarna, Sofort, Bancontact, giropay) no longer leave the WP page, button/preset layout and styling were polished, the default preset selection and thank-you text were adjusted, and the Divi-configured goal now always takes precedence over the campaign API's goal.

### Changed

- Removed the editor-only config-hint/notice boxes from all modules ([#131](https://github.com/Volksverpetzer/vvp_divi5_extensions/pull/131)).
- Replaced the 944-line hand-rolled component preview page with Storybook, with a full-width, responsive preview during the transition ([#126](https://github.com/Volksverpetzer/vvp_divi5_extensions/pull/126), [#127](https://github.com/Volksverpetzer/vvp_divi5_extensions/pull/127)).
- Simplified the article card footer per design feedback ([#120](https://github.com/Volksverpetzer/vvp_divi5_extensions/pull/120)).

### Fixed

- Fixed a `build.mjs` race where parallel bundle builds could corrupt `styles/main.css` by writing to the same output path ([#121](https://github.com/Volksverpetzer/vvp_divi5_extensions/pull/121)).

## [1.1.0] - 2026-07-28

First release with a maintained changelog; entries cover everything since v1.0.6.

### Added

- **Campaign Progress** and **Campaign Donate** Divi 5 modules ([#104](https://github.com/Volksverpetzer/vvp_divi5_extensions/pull/104)).
- **Related Items** module ("Passend dazu") ([#102](https://github.com/Volksverpetzer/vvp_divi5_extensions/pull/102)).
- PayPal option in Campaign Donate ([#108](https://github.com/Volksverpetzer/vvp_divi5_extensions/pull/108)).

### Changed

- ContentOverview now filters the YouTube feed to regular videos by duration instead of relying only on a Shorts probe ([#109](https://github.com/Volksverpetzer/vvp_divi5_extensions/pull/109)).
- Campaign Progress preview fills to 50% with a simplified hint, and the donate button was moved out of Campaign Progress into Campaign Donate; both live-update in the builder ([#107](https://github.com/Volksverpetzer/vvp_divi5_extensions/pull/107), [#108](https://github.com/Volksverpetzer/vvp_divi5_extensions/pull/108)).
- Colocated the ArticleCard styles in `shared/ArticleCard.scss` ([#99](https://github.com/Volksverpetzer/vvp_divi5_extensions/pull/99)).
- Updated build dependencies (eslint, postcss, sass) ([#101](https://github.com/Volksverpetzer/vvp_divi5_extensions/pull/101)).
- Related Items now resolves the current post via `get_queried_object_id()` instead of `get_the_ID()`, fixing lookups under the Divi Theme Builder ([#114](https://github.com/Volksverpetzer/vvp_divi5_extensions/pull/114)).
- Related Items falls back to the Yoast meta description when a post's excerpt is empty ([#115](https://github.com/Volksverpetzer/vvp_divi5_extensions/pull/115)).
- Bumped further build dependencies.

### Fixed

- Field values were read from the wrong `attrs` path and always fell back to the empty/placeholder default ([#105](https://github.com/Volksverpetzer/vvp_divi5_extensions/pull/105)).
- The same `attrs.<name>.innerContent` path bug in the pre-existing modules ([#106](https://github.com/Volksverpetzer/vvp_divi5_extensions/pull/106)).
- Related Items now purges a post's own cache on publish/update ([#103](https://github.com/Volksverpetzer/vvp_divi5_extensions/pull/103)).
- Related Items caches empty/failed fetch results for 5 minutes instead of 6 hours, so a transient upstream failure no longer sticks around all day ([#111](https://github.com/Volksverpetzer/vvp_divi5_extensions/pull/111)).
- Related Items' cache key is now versioned (`CACHE_VERSION`), so a code change that affects what gets cached can invalidate every existing entry immediately on deploy instead of waiting out the TTL or relying on a manual post re-save ([#116](https://github.com/Volksverpetzer/vvp_divi5_extensions/pull/116)).
- Trending List and Trending Items now cache an empty result (WPP inactive/misconfigured, or a range with no matching posts) for 5 minutes instead of the full 1-hour TTL — the same failure mode fixed for Related Items in #111.
- Whitespace fix in Campaign Progress.

### Infrastructure

- Both deploy workflows now purge the Bunny CDN cache for this plugin's assets after each deploy. Bunny previously ignored the `?ver=` cache-buster and served the plugin's JS/CSS for up to 30 days regardless of how many times it was redeployed ([#117](https://github.com/Volksverpetzer/vvp_divi5_extensions/pull/117)).

[1.2.0]: https://github.com/Volksverpetzer/vvp_divi5_extensions/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/Volksverpetzer/vvp_divi5_extensions/compare/v1.0.6...v1.1.0

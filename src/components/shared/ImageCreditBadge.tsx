import * as React from "react";
import { toHttpUrl } from "../../utils/links";

/**
 * An image's Image Source Control credit, as CardRenderTrait.php's
 * get_post_image_credit() passes it (same fields as vvp_app's ImageCredit).
 */
export interface ImageCredit {
  source: string;
  source_url?: string;
  licence?: string;
}

/**
 * Lucide's "info" icon, as in vvp_app's ImageCreditBadge. Byte-matches
 * INFO_ICON_SVG in CardRenderTrait.php (hydration guardrail).
 */
const InfoIcon: React.FC = () => (
  <svg
    aria-hidden="true"
    focusable="false"
    width="16"
    height="16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
  >
    <circle cx="12" cy="12" r="10"></circle>
    <path d="M12 16v-4"></path>
    <path d="M12 8h.01"></path>
  </svg>
);

// Popover ids, unique across the page. Not React's useId(): every card
// hydrates through its own hydrateRoot() (content-overview frontend.tsx),
// and useId() is scoped per root, so two cards' popovers could share an id
// (see PodcastBanner.tsx). The id never appears in the server markup — only
// on the opened popover — so this can't cause a hydration mismatch.
let nextPopoverId = 0;

// Gap kept between the popover and the card's edges, and between the
// popover and the badge (px; the latter matches ArticleCard.css).
const POPOVER_INSET = 8;
const POPOVER_GAP = 4;

const isActivationKey = (e: React.KeyboardEvent) =>
  (e.key === "Enter" || e.key === " ") && !e.repeat;

/**
 * Small "i" badge over the top-right corner of an article card's image —
 * the web counterpart of vvp_app's ImageCreditBadge (which sits bottom-right;
 * on the web that clashes with our featured images' white logo bar). Clicking it opens a
 * popover with the image credit (source, licence, source link).
 *
 * It sits inside the card's <a>, which allows no nested links or buttons, so
 * the controls are spans with ARIA roles (like the card's category link), and
 * every click inside is kept from following the card link. The popover only
 * renders once opened, so the server markup (CardRenderTrait.php) is just
 * the closed badge.
 */
export const ImageCreditBadge: React.FC<{ credit: ImageCredit }> = ({
  credit,
}) => {
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef<HTMLSpanElement>(null);
  const buttonRef = React.useRef<HTMLSpanElement>(null);
  const popoverRef = React.useRef<HTMLSpanElement>(null);
  const [popoverId] = React.useState(() => `vvp-co-credit-${++nextPopoverId}`);

  // The card clips its overflow (its width is capped by CSS: the badge row
  // spans the card). The popover opens downwards from the badge, over the
  // image and, if need be, the card's text; its height is capped at the room
  // left there, and longer credits scroll.
  React.useLayoutEffect(() => {
    const popover = popoverRef.current;
    const button = buttonRef.current;
    const card = rootRef.current?.closest(".vvp-co__feed-card");
    if (!open || !popover || !button || !card) return;
    const room =
      card.getBoundingClientRect().bottom -
      POPOVER_INSET -
      button.getBoundingClientRect().bottom -
      POPOVER_GAP;
    if (room > 0) popover.style.maxHeight = `${room}px`;
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      buttonRef.current?.focus();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  // Keep clicks and activation keys inside the badge from reaching the card
  // link (navigation and its Plausible click event).
  const stop = (e: React.SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const toggle = (e: React.SyntheticEvent) => {
    stop(e);
    setOpen((o) => !o);
  };

  // Only ever open http(s): the URL is free-form admin input that can come
  // from remote REST data.
  const sourceUrl = credit.source_url ? toHttpUrl(credit.source_url) : null;
  const openSource = (e: React.SyntheticEvent) => {
    stop(e);
    if (sourceUrl) window.open(sourceUrl.href, "_blank", "noopener,noreferrer");
  };

  return (
    <span ref={rootRef} className="vvp-co__credit" onClick={stop}>
      <span
        ref={buttonRef}
        className="vvp-co__credit-btn"
        role="button"
        tabIndex={0}
        aria-label="Bildquelle anzeigen"
        aria-expanded={open}
        aria-controls={open ? popoverId : undefined}
        onClick={toggle}
        onKeyDown={(e) => {
          if (isActivationKey(e)) toggle(e);
        }}
      >
        <InfoIcon />
      </span>
      {open && (
        <span
          ref={popoverRef}
          id={popoverId}
          className="vvp-co__credit-popover"
          role="dialog"
          aria-label="Bildquelle"
        >
          <span className="vvp-co__credit-title">Bildquelle</span>
          <span className="vvp-co__credit-source">{credit.source}</span>
          {credit.licence && (
            <span className="vvp-co__credit-licence">{credit.licence}</span>
          )}
          {sourceUrl && (
            <span
              className="vvp-co__credit-link"
              role="link"
              tabIndex={0}
              onClick={openSource}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.repeat) openSource(e);
              }}
            >
              {sourceUrl.href}
            </span>
          )}
        </span>
      )}
    </span>
  );
};

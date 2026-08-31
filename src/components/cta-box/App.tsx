import React, { type ReactElement } from "react";
import { type CtaBoxAppProps, type CtaBoxIcon } from "./types";

// buttonUrl round-trips through a data-* DOM attribute (see frontend.tsx)
// before landing here, so it must be treated as untrusted: a "javascript:"
// URL would otherwise execute on click. Only allow the schemes an editor
// could plausibly need for a CTA link, plus same-site relative/anchor URLs.
const SAFE_BUTTON_URL = /^(https?:|mailto:|tel:|\/|#)/i;

const getSafeButtonUrl = (url: string): string | null => {
  const trimmed = url.trim();
  return SAFE_BUTTON_URL.test(trimmed) ? trimmed : null;
};

const ICONS: Record<Exclude<CtaBoxIcon, "none">, ReactElement> = {
  star: (
    <path d="M12 2.5l2.9 6.6 7.1.7-5.4 4.8 1.6 7-6.2-3.7-6.2 3.7 1.6-7L2 9.8l7.1-.7L12 2.5z" />
  ),
  bookmark: <path d="M6 3h12v18l-6-4.5L6 21V3z" />,
  bell: (
    <path d="M12 2a6 6 0 00-6 6v4.2l-1.7 3.4A1 1 0 005.2 17h13.6a1 1 0 00.9-1.4L18 12.2V8a6 6 0 00-6-6zM9.5 20a2.5 2.5 0 005 0h-5z" />
  ),
  newspaper: (
    <path d="M4 4h13a2 2 0 012 2v13a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 3v2h9V7H6zm0 4v2h9v-2H6zm0 4v2h6v-2H6zm13-8v11a1 1 0 001-1V6h-1z" />
  ),
  heart: (
    <path d="M12 21s-7.5-4.7-10-9.3C.4 8.4 2.1 5 5.6 5c2 0 3.5 1 6.4 4 2.9-3 4.4-4 6.4-4 3.5 0 5.2 3.4 3.6 6.7C19.5 16.3 12 21 12 21z" />
  ),
  check: <path d="M9 16.2l-3.5-3.5L4 14.2l5 5 11-11-1.5-1.5z" />,
};

const CtaBoxIconGraphic = ({
  icon,
}: {
  icon: CtaBoxIcon;
}): ReactElement | null => {
  if (icon === "none") return null;

  return (
    <span className="vvp-cta-box__icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="currentColor">
        {ICONS[icon]}
      </svg>
    </span>
  );
};

export const CtaBoxApp = ({
  icon,
  heading,
  text,
  buttonLabel,
  buttonUrl,
  buttonNewTab,
  variant,
}: CtaBoxAppProps): ReactElement => {
  const safeButtonUrl = getSafeButtonUrl(buttonUrl);
  const hasButton = buttonLabel.trim() !== "" && safeButtonUrl !== null;

  return (
    <div className={`vvp-cta-box vvp-cta-box--${variant}`}>
      <CtaBoxIconGraphic icon={icon} />
      <div className="vvp-cta-box__body">
        {heading && <p className="vvp-cta-box__heading">{heading}</p>}
        {text && <p className="vvp-cta-box__text">{text}</p>}
      </div>
      {hasButton && (
        <a
          className="vvp-cta-box__button"
          href={safeButtonUrl as string}
          target={buttonNewTab ? "_blank" : undefined}
          rel={buttonNewTab ? "noopener noreferrer" : undefined}
        >
          {buttonLabel}
        </a>
      )}
    </div>
  );
};

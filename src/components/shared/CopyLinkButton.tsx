import * as React from "react";

/**
 * HYDRATION GUARDRAIL: the markup this renders (in its default, not-yet-copied
 * state) is mirrored by hand in CardRenderTrait.php's render_featured_card, so
 * ArticleCard's usage of it can hydrate over PHP's static HTML. Keep the two
 * sides in sync — see the guardrail comment in frontend.tsx for the full rules.
 */
export interface CopyLinkButtonProps {
  link: string;
  className?: string;
}

const CopyIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M15 7h3a5 5 0 0 1 0 10h-3m-6 0H6a5 5 0 0 1 0-10h3"></path>
    <line x1="8" y1="12" x2="16" y2="12"></line>
  </svg>
);

const CheckIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

export const CopyLinkButton: React.FC<CopyLinkButtonProps> = ({
  link,
  className,
}) => {
  const [copied, setCopied] = React.useState(false);
  const timeoutRef = React.useRef<number | null>(null);

  React.useEffect(
    () => () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    },
    [],
  );

  const copyLink = () => {
    navigator.clipboard
      ?.writeText(link)
      .then(() => {
        setCopied(true);
        if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
        timeoutRef.current = window.setTimeout(() => setCopied(false), 1500);
      })
      .catch(() => {});
  };

  const handleClick = (e: React.SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
    copyLink();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === "Enter" || e.key === " ") && !e.repeat) {
      e.preventDefault();
      e.stopPropagation();
      copyLink();
    }
  };

  return (
    <span
      role="button"
      tabIndex={0}
      className={"vvp-co__copy-link-btn" + (className ? ` ${className}` : "")}
      aria-label={copied ? "Link kopiert" : "Link kopieren"}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      {copied ? <CheckIcon /> : <CopyIcon />}
    </span>
  );
};

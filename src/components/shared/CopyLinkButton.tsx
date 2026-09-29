import * as React from "react";

export interface CopyLinkButtonProps {
  link: string;
  className?: string;
}

// Octicons "link-external" — same icon the app uses for Bluesky links
// (see ExternalLinkIcon in vvp_app's Icons.tsx).
// Sized to match --vvp-icon-size-xs (16px); actual rendered size is set
// by the .vvp-co__copy-link-btn svg CSS rule off that same token.
const CopyIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M10.604 1h4.146a.25.25 0 0 1 .25.25v4.146a.25.25 0 0 1-.427.177L13.03 4.03 9.28 7.78a.75.75 0 0 1-1.06-1.06l3.75-3.75-1.543-1.543a.25.25 0 0 1 .177-.427ZM3.75 2A1.75 1.75 0 0 0 2 3.75v8.5c0 .966.784 1.75 1.75 1.75h8.5A1.75 1.75 0 0 0 14 12.25v-3.5a.75.75 0 0 0-1.5 0v3.5a.25.25 0 0 1-.25.25h-8.5a.25.25 0 0 1-.25-.25v-8.5a.25.25 0 0 1 .25-.25h3.5a.75.75 0 0 0 0-1.5h-3.5Z"></path>
  </svg>
);

const CheckIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
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

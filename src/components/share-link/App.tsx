import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactElement,
} from "react";
import { Button } from "@volksverpetzer/ui-web";
import { trackEvent } from "../../utils/plausible";
import { displayUrl, qrSvg } from "./share-url";

export type ShareLinkAppProps = {
  title: string;
  text: string;
  /** Already validated by the caller (safeShareUrl). */
  url: string;
  qrLabel: string;
  /** Plausible events; callers pass false in the Visual Builder/Storybook. */
  track?: boolean;
};

const STATUS_RESET_MS = 2000;

const noopSubscribe = () => () => {};

export const ShareLinkApp = ({
  title,
  text,
  url,
  qrLabel,
  track = true,
}: ShareLinkAppProps): ReactElement => {
  // false on the server and during hydration, then the real value.
  const canShare = useSyncExternalStore(
    noopSubscribe,
    () => typeof navigator.share === "function",
    () => false,
  );
  const [status, setStatus] = useState("");
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    },
    [],
  );

  const svg = useMemo(() => qrSvg(url), [url]);

  const showStatus = (message: string) => {
    setStatus(message);
    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setStatus(""), STATUS_RESET_MS);
  };

  const handleShare = async () => {
    try {
      await navigator.share({ title, text, url });
    } catch {
      return; // cancelled or failed: stay silent
    }
    if (track) trackEvent("Link Shared", { method: "native-share", url });
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      showStatus("Konnte Link nicht kopieren.");
      return;
    }
    showStatus("Link kopiert!");
    if (track) trackEvent("Link Copied", { location: "share", url });
  };

  return (
    <div className="vvp-share-link">
      {svg && (
        <div className="vvp-share-link__qr">
          <div
            className="vvp-share-link__qr-code"
            dangerouslySetInnerHTML={{ __html: svg }}
          />
          <span className="vvp-share-link__qr-label">{qrLabel}</span>
        </div>
      )}
      <div className="vvp-share-link__body">
        <h3 className="vvp-share-link__title">{title}</h3>
        {text && <p className="vvp-share-link__text">{text}</p>}
        <a className="vvp-share-link__url" href={url} title={url}>
          {displayUrl(url)}
        </a>
        <div className="vvp-share-link__actions">
          {canShare && (
            <Button
              type="button"
              variant="secondary"
              className="vvp-share-link__btn vvp-share-link__btn--share"
              onClick={handleShare}
            >
              Teilen
            </Button>
          )}
          <Button
            type="button"
            variant="secondary"
            className="vvp-share-link__btn vvp-share-link__btn--copy"
            onClick={handleCopy}
          >
            Link kopieren
          </Button>
        </div>
        <p className="vvp-share-link__status" aria-live="polite">
          {status}
        </p>
      </div>
    </div>
  );
};

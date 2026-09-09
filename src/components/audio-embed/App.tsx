import React, { useEffect, useRef, useState, type ReactElement } from "react";
import { DEFAULT_AUDIO_BASE_URL, RESIZE_MESSAGE_TYPE } from "./constants";
import { type AudioEmbedAppProps } from "./types";

/**
 * Embeds the vvp_wp_audio_converter player (or its "not yet available"
 * state) for the current article in an iframe. The iframe starts at height
 * 0 -- vvp_wp_audio_converter's EmbedHeightReporter posts the real content
 * height once it knows whether there's a player to show, so an article
 * without audio yet leaves no visible gap instead of a fixed empty box.
 */
export const AudioEmbedApp = ({
  slug,
  audioBaseUrl,
}: AudioEmbedAppProps): ReactElement | null => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      // Only trust a message that actually came from this component's own
      // iframe -- the page can carry many third-party iframes (Twitter,
      // Stripe, ...), and postMessage has no built-in sender restriction.
      if (
        !iframeRef.current ||
        event.source !== iframeRef.current.contentWindow
      ) {
        return;
      }

      const data = event.data as { type?: unknown; height?: unknown } | null;
      if (!data || data.type !== RESIZE_MESSAGE_TYPE) return;

      const nextHeight = Number(data.height);
      if (!Number.isFinite(nextHeight) || nextHeight < 0) return;
      setHeight(nextHeight);
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  if (!slug) return null;

  // Both audioBaseUrl and slug round-trip through data-* DOM attributes
  // (frontend.tsx) before reaching here, so both must be treated as
  // untrusted -- a "javascript:" value for either would otherwise execute
  // in the iframe's initial same-origin context. Resolve them through the
  // URL API instead of concatenating raw strings: a manually-concatenated
  // guard only covers whichever piece the regex happens to anchor on
  // (CodeQL's js/xss-through-dom kept flagging that), whereas checking
  // .protocol on the URL object both sources actually resolve to is a
  // single barrier that covers all of it.
  let url: URL;
  try {
    url = new URL(
      encodeURIComponent(slug),
      (audioBaseUrl || DEFAULT_AUDIO_BASE_URL).replace(/\/?$/, "/"),
    );
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  const src = url.href;

  return (
    <div className="vvp-audio-embed__frame" style={{ height }}>
      <iframe
        ref={iframeRef}
        src={src}
        title="Audio player"
        loading="lazy"
        allow="autoplay; encrypted-media; clipboard-write"
        aria-label="Audio player for this page"
        className="vvp-audio-embed__iframe"
      />
    </div>
  );
};

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

  // Both audioBaseUrl and slug round-trip through data-* DOM attributes
  // (frontend.tsx) before reaching here, so both must be treated as
  // untrusted -- a "javascript:" value for either would otherwise execute
  // in the iframe's initial same-origin context. Resolve them through the
  // URL API instead of concatenating raw strings: a manually-concatenated
  // guard only covers whichever piece the regex happens to anchor on
  // (CodeQL's js/xss-through-dom kept flagging that), whereas checking
  // .protocol on the URL object both sources actually resolve to is a
  // single barrier that covers all of it.
  let url: URL | null = null;
  if (slug) {
    try {
      const candidate = new URL(
        encodeURIComponent(slug),
        // trim() so a whitespace-only Divi field value (truthy, so `||`
        // alone won't fall back to the default) doesn't reach new URL()
        // as an invalid base and make the whole embed disappear -- the
        // PHP render_callback already trims for the same reason.
        (audioBaseUrl.trim() || DEFAULT_AUDIO_BASE_URL).replace(/\/?$/, "/"),
      );
      if (candidate.protocol === "https:" || candidate.protocol === "http:") {
        url = candidate;
      }
    } catch {
      url = null;
    }
  }

  // handleMessage below reads this ref rather than closing over `url`
  // directly, since the message-listener effect only registers once
  // (mount) but this component can re-render with a different
  // slug/audioBaseUrl (e.g. live-editing the setting in the Visual
  // Builder). Kept in sync via its own effect rather than assigned
  // during render, which React refs don't allow.
  const expectedOriginRef = useRef<string | null>(null);
  const expectedOrigin = url?.origin ?? null;
  useEffect(() => {
    expectedOriginRef.current = expectedOrigin;
  }, [expectedOrigin]);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      // Trust a message only if it came from this component's own iframe
      // window AND that window's current document is still on the origin
      // we embedded. event.source alone isn't enough: if the iframe ever
      // navigates away (a redirect, a target="_self" link inside the
      // embedded page), event.source stays the same window object even
      // though whatever can now postMessage into it is no longer
      // audio.volksverpetzer-app.de.
      if (
        !iframeRef.current ||
        event.source !== iframeRef.current.contentWindow ||
        !expectedOriginRef.current ||
        event.origin !== expectedOriginRef.current
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

  if (!url) return null;

  return (
    <div className="vvp-audio-embed__frame" style={{ height }}>
      <iframe
        ref={iframeRef}
        src={url.href}
        title="Audio-Player"
        loading="lazy"
        allow="autoplay; encrypted-media; clipboard-write"
        aria-label="Audio-Player für diesen Artikel"
        className="vvp-audio-embed__iframe"
      />
    </div>
  );
};

declare global {
  interface Window {
    plausible?: (
      event: string,
      options?: { props?: Record<string, string>; u?: string },
    ) => void;
  }
}

export const trackEvent = (
  event: string,
  props?: Record<string, string>,
): void => {
  try {
    if (typeof window.plausible === "function") {
      window.plausible(event, props ? { props } : undefined);
    }
  } catch (_) {}
};

/** Record a pageview for a virtual URL (e.g. one per Instagram post). */
export const trackPageview = (url: string): void => {
  try {
    if (typeof window.plausible === "function") {
      window.plausible("pageview", { u: url });
    }
  } catch (_) {}
};

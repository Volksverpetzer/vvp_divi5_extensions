declare global {
  interface Window {
    plausible?: (event: string, options?: { props?: Record<string, string>; u?: string }) => void;
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

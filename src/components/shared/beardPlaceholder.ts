// placebeard.it placeholder, used for Prüfpunkt example content so it's
// visually distinct from Volksverpetzer's cat theme (see catPlaceholder.ts).
// Unlike placecats.com, placebeard.it has no named-subject selection, so
// there's no seed-based determinism here — just width/height.
export const beardPlaceholderImage = (w = 640, h = 360): string => {
  return `https://placebeard.it/${w}x${h}`;
};

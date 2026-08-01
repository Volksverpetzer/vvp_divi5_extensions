// Deterministic placecats.com cat-photo placeholder, shared by every
// module's Visual Builder edit preview (and the standalone preview app)
// so example cards have a stable, non-empty image instead of a broken
// via.placeholder.com link.
const CATS = ["neo", "millie", "bella", "poppy", "louie"] as const;

export const catPlaceholderImage = (seed: string, w = 640, h = 360): string => {
  const cat =
    CATS[seed.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % CATS.length];
  return `https://placecats.com/${cat}/${w}/${h}`;
};

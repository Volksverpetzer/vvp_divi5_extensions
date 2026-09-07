export const formatAuthors = (authors: string[]): string => {
  const names = authors.filter(Boolean);
  if (names.length === 0) {
    return "";
  }
  if (names.length === 1) {
    return names[0];
  }
  return `${names.slice(0, -1).join(", ")} und ${names[names.length - 1]}`;
};

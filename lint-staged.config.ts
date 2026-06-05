import type { Configuration } from "lint-staged";

const config: Configuration = {
  "*.{ts,tsx,js,jsx,mjs}": "eslint --fix",
  "*.{json,md,yml,yaml,scss,css}": "prettier --write",
};

export default config;

#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { existsSync, rmSync } from "node:fs";

const OUTPUT = "vvp-divi5-extensions.zip";

if (existsSync(OUTPUT)) rmSync(OUTPUT);

const excludes = [
  "node_modules/*",
  "src/*",
  "vendor/*",
  "preview/*",
  "*.zip",
  "zip.mjs",
  "build.mjs",
  "webpack.config.js",
  "vite.config.ts",
  "vitest.config.ts",
  "tsconfig.json",
  "eslint.config.mjs",
  "cspell.config.json",
  "lint-staged.config.ts",
  "package.json",
  "pnpm-lock.yaml",
  "pnpm-workspace.yaml",
  "composer.json",
  "composer.lock",
  "dev-preview.php",
  ".git/*",
  ".github/*",
  ".husky/*",
  ".idea/*",
  ".claude/*",
  ".env",
  ".gitignore",
  ".gitleaks.toml",
  ".prettierrc",
];

const args = ["-r", OUTPUT, ".", ...excludes.flatMap((p) => ["--exclude", p])];
const { status } = spawnSync("zip", args, { stdio: "inherit" });
process.exit(status ?? 1);

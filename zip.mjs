#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { existsSync, rmSync } from "node:fs";

const OUTPUT = "vvp-divi5-extensions.zip";

if (existsSync(OUTPUT)) rmSync(OUTPUT);

const excludes = [
  "node_modules/*",
  "src/*",
  "vendor/*",
  "*.zip",
  "zip.mjs",
  "webpack.config.js",
  "tsconfig.json",
  "package.json",
  "package-lock.json",
  "composer.json",
  "composer.lock",
  "dev-preview.php",
  ".claude/*",
];

const args = ["-r", OUTPUT, ".", ...excludes.flatMap((p) => ["--exclude", p])];
const { status } = spawnSync("zip", args, { stdio: "inherit" });
process.exit(status ?? 1);

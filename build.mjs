import { build } from "vite";
import react from "@vitejs/plugin-react";
import {
  rmSync,
  mkdirSync,
  readdirSync,
  cpSync,
  renameSync,
  existsSync,
} from "fs";
import { join, resolve } from "path";

const isWatch = process.argv.includes("--watch");
const isProduction = process.env.NODE_ENV === "production";

// After each main bundle write, move the extracted CSS to styles/main.css.
// Vite lib builds emit CSS into outDir alongside the JS.
const moveCssPlugin = {
  name: "move-css-to-styles",
  writeBundle(options, bundle) {
    for (const fileName of Object.keys(bundle)) {
      if (fileName.endsWith(".css")) {
        renameSync(join(options.dir, fileName), resolve("./styles/main.css"));
      }
    }
  },
};

// WordPress / Divi globals — replaces webpack's array-path externals syntax.
// e.g. ["vendor", "React"] → vendor.React  (same runtime value, different syntax)
const wpGlobals = {
  react: "vendor.React",
  "react-dom": "vendor.ReactDOM",
  "@wordpress/hooks": "vendor.wp.hooks",
  "@wordpress/i18n": "vendor.wp.i18n",
  "@divi/module": "divi.module",
  "@divi/module-library": "divi.moduleLibrary",
  "@divi/types": "divi.types",
  "@divi/icon-library": "divi.iconLibrary",
};

function copyModuleJsons() {
  const componentsDir = "./src/components";
  const outputDir = "./modules-json";
  for (const entry of readdirSync(componentsDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    for (const file of [
      "module.json",
      "module-default-render-attributes.json",
    ]) {
      const src = join(componentsDir, entry.name, file);
      if (existsSync(src)) {
        const destDir = join(outputDir, entry.name);
        mkdirSync(destDir, { recursive: true });
        cpSync(src, join(destDir, file));
      }
    }
  }
}

const commonBuild = {
  emptyOutDir: false,
  sourcemap: !isProduction,
  minify: isProduction,
  watch: isWatch ? {} : undefined,
};

const frontends = [
  {
    name: "fact-check-frontend",
    entry: "./src/components/fact-check-search/frontend.tsx",
  },
  {
    name: "content-overview-frontend",
    entry: "./src/components/content-overview/frontend.tsx",
  },
  {
    name: "author-profile-frontend",
    entry: "./src/components/author-profile/frontend.tsx",
  },
  {
    name: "trending-items-frontend",
    entry: "./src/components/trending-items/frontend.tsx",
  },
  {
    name: "trending-list-frontend",
    entry: "./src/components/trending-list/frontend.tsx",
  },
];

if (!isWatch) {
  for (const dir of ["./scripts", "./styles"]) {
    rmSync(dir, { recursive: true, force: true });
    mkdirSync(dir, { recursive: true });
  }
}

await Promise.all([
  // Divi Visual Builder bundle — externals reference WordPress / Divi globals
  build({
    configFile: false,
    root: ".",
    plugins: [react(), moveCssPlugin],
    css: {
      preprocessorOptions: {
        scss: { silenceDeprecations: ["legacy-js-api"] },
      },
    },
    build: {
      ...commonBuild,
      lib: {
        entry: "./src/index.ts",
        formats: ["iife"],
        name: "VvpBundle",
        fileName: () => "bundle.js",
      },
      outDir: "scripts",
      rollupOptions: {
        external: Object.keys(wpGlobals),
        output: { globals: wpGlobals },
      },
    },
  }),

  // Frontend bundles — React is bundled in (no WordPress externals)
  ...frontends.map(({ name, entry }) =>
    build({
      configFile: false,
      root: ".",
      plugins: [react()],
      build: {
        ...commonBuild,
        lib: {
          entry,
          formats: ["iife"],
          name: `Vvp_${name.replace(/-/g, "_")}`,
          fileName: () => `${name}.js`,
        },
        outDir: "scripts",
      },
    }),
  ),
]);

copyModuleJsons();

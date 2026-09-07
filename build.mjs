import { build } from "vite";
import react from "@vitejs/plugin-react";
import {
  rmSync,
  mkdirSync,
  readdirSync,
  cpSync,
  renameSync,
  existsSync,
  watch,
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

// Vite lib-mode builds keep `process.env.NODE_ENV` as-is, which throws
// "process is not defined" in the browser — replace it statically.
const define = {
  "process.env.NODE_ENV": JSON.stringify(
    isProduction ? "production" : "development",
  ),
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
  {
    name: "related-items-frontend",
    entry: "./src/components/related-items/frontend.tsx",
  },
  {
    name: "campaign-progress-frontend",
    entry: "./src/components/campaign-progress/frontend.tsx",
  },
  {
    name: "campaign-donate-frontend",
    entry: "./src/components/campaign-donate/frontend.tsx",
  },
  {
    name: "cta-box-frontend",
    entry: "./src/components/cta-box/frontend.tsx",
  },
];

for (const dir of ["./scripts", "./styles"]) {
  if (!isWatch) rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
}

await Promise.all([
  // Divi Visual Builder bundle — externals reference WordPress / Divi globals
  build({
    configFile: false,
    root: ".",
    define,
    plugins: [react(), moveCssPlugin],
    resolve: {
      // The automatic JSX runtime isn't covered by the `react` external and
      // would bundle React 19's runtime, whose elements React 18 in the
      // Visual Builder rejects (React error #31). The shim creates elements
      // via the external vendor.React instead.
      alias: {
        "react/jsx-runtime": resolve("./src/jsx-runtime-shim.ts"),
        "react/jsx-dev-runtime": resolve("./src/jsx-runtime-shim.ts"),
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
        // Vite's lib-mode CSS filename defaults to the package name, which
        // every one of these parallel builds would otherwise share — give
        // this build its own name so it can't collide with a frontend
        // bundle's CSS output (see the frontends map below).
        output: { globals: wpGlobals, assetFileNames: "bundle.css" },
      },
    },
  }),

  // Frontend bundles — React is bundled in (no WordPress externals).
  // Any CSS these emit is redundant (the page already loads styles/main.css
  // from the bundle above) and is deleted after the build; it just needs a
  // name that can't collide with "bundle.css" while the parallel builds run.
  ...frontends.map(({ name, entry }) =>
    build({
      configFile: false,
      root: ".",
      define,
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
        rollupOptions: {
          output: { assetFileNames: `${name}.[ext]` },
        },
      },
    }),
  ),
]);

// Frontend bundles emit their own (unused) CSS alongside their JS — see the
// comment above the frontends map. Delete it so scripts/ only ever holds JS.
for (const { name } of frontends) {
  const cssPath = resolve("./scripts", `${name}.css`);
  if (existsSync(cssPath)) rmSync(cssPath);
}

copyModuleJsons();

// The module JSONs aren't imported by any bundle, so Vite's watcher never
// sees them — watch them ourselves to keep modules-json/ in sync.
if (isWatch) {
  watch("./src/components", { recursive: true }, (_event, filename) => {
    if (filename?.endsWith(".json")) copyModuleJsons();
  });
}

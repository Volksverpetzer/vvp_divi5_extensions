import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: ["../src/components/**/*.stories.@(ts|tsx)"],
  addons: [],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  viteFinal: async (config) => {
    config.css ??= {};
    config.css.preprocessorOptions = {
      scss: {
        // silence deprecation warnings from legacy sass API
        silenceDeprecations: ["legacy-js-api"],
      },
    };
    return config;
  },
};

export default config;

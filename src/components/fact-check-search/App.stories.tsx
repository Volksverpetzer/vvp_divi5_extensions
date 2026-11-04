import type { Meta, StoryObj } from "@storybook/react-vite";
import { FactCheckSearchApp } from "./App";

const meta: Meta<typeof FactCheckSearchApp> = {
  title: "Modules/FactCheckSearch",
  component: FactCheckSearchApp,
};

export default meta;
type Story = StoryObj<typeof FactCheckSearchApp>;

/** Every prop exposed as a control. */
export const Playground: Story = {
  args: {
    searchApiUrl: "https://ai.volksverpetzer-app.de/api/vector-search/",
    importApiUrl: "https://ai.volksverpetzer-app.de/api/import-url/",
  },
};

import type { Meta, StoryObj } from "@storybook/react-vite";
import { FactCheckSearchApp } from "./App";

const meta: Meta<typeof FactCheckSearchApp> = {
  title: "Modules/FactCheckSearch",
  component: FactCheckSearchApp,
};

export default meta;
type Story = StoryObj<typeof FactCheckSearchApp>;

export const Default: Story = {
  args: {
    searchApiUrl: "https://ai.volksverpetzer-app.de/api/vector-search/",
    importApiUrl: "https://ai.volksverpetzer-app.de/api/import-url/",
  },
};

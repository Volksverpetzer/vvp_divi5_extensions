import type { Meta, StoryObj } from "@storybook/react-vite";
import { YouTubeBanner } from "./YouTubeBanner";
import { FEED_YT } from "../shared/previewFixtures";

const meta: Meta<typeof YouTubeBanner> = {
  title: "Modules/ContentOverview/YouTubeBanner",
  component: YouTubeBanner,
};

export default meta;
type Story = StoryObj<typeof YouTubeBanner>;

export const Default: Story = {
  args: FEED_YT,
};

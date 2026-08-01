import type { Meta, StoryObj } from "@storybook/react-vite";
import { PodcastBanner } from "./PodcastBanner";
import { PODCAST_PROPS } from "../shared/previewFixtures";

const meta: Meta<typeof PodcastBanner> = {
  title: "Modules/ContentOverview/PodcastBanner",
  component: PodcastBanner,
};

export default meta;
type Story = StoryObj<typeof PodcastBanner>;

export const Default: Story = {
  args: PODCAST_PROPS,
};

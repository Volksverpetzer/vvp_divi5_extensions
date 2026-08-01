import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { AuthorProfileApp } from "./App";
import { PreviewCard } from "../shared/PreviewCard";
import { AUTHOR_SINGLE, AUTHOR_MULTI } from "../shared/previewFixtures";

const meta: Meta<typeof AuthorProfileApp> = {
  title: "Modules/AuthorProfile",
  component: AuthorProfileApp,
  decorators: [
    (Story) => (
      <PreviewCard moduleClass="vvp-author-profile">{Story()}</PreviewCard>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof AuthorProfileApp>;

export const Vertical: Story = {
  args: {
    authors: AUTHOR_SINGLE,
    showAvatar: true,
    showBio: true,
    showLink: true,
    layout: "vertical",
    avatarSize: 80,
  },
};

export const HorizontalCoAuthors: Story = {
  name: "Horizontal (co-authors)",
  args: {
    authors: AUTHOR_MULTI,
    showAvatar: true,
    showBio: true,
    showLink: true,
    layout: "horizontal",
    avatarSize: 120,
  },
};

export const NoAvatarNoLink: Story = {
  args: {
    authors: AUTHOR_SINGLE,
    showAvatar: false,
    showBio: true,
    showLink: false,
    layout: "vertical",
    avatarSize: 80,
  },
};

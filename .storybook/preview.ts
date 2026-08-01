import type { Preview } from "@storybook/react-vite";
import "../src/global.scss";
import "../src/components/fact-check-search/style.scss";
import "../src/components/content-overview/style.scss";
import "../src/components/author-profile/style.scss";
import "../src/components/trending-items/style.scss";
import "../src/components/trending-list/style.scss";
import "../src/components/related-items/style.scss";
import "../src/components/campaign-progress/style.scss";
import "../src/components/campaign-donate/style.scss";

const preview: Preview = {
  parameters: {
    layout: "padded",
  },
};

export default preview;

import type { Preview } from "@storybook/react-vite";
import "../src/global.css";
import "../src/components/fact-check-search/style.css";
import "../src/components/content-overview/style.css";
import "../src/components/author-profile/style.css";
import "../src/components/trending-items/style.css";
import "../src/components/trending-list/style.css";
import "../src/components/related-items/style.css";
import "../src/components/campaign-progress/style.css";
import "../src/components/campaign-donate/style.css";
import "../src/components/cta-box/style.css";

const preview: Preview = {
  parameters: {
    layout: "padded",
  },
};

export default preview;

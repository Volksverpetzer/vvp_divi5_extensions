import { omit } from "lodash";
import { addAction } from "@wordpress/hooks";
import { registerModule } from "@divi/module-library";

// Import modules.
import { factCheckSearch } from "./components/fact-check-search";
import { contentOverview } from "./components/content-overview";
import { authorProfile } from "./components/author-profile";
import { trendingItems } from "./components/trending-items";
import { trendingList } from "./components/trending-list";
import { relatedItems } from "./components/related-items";
import { campaignProgress } from "./components/campaign-progress";
import { campaignDonate } from "./components/campaign-donate";

// Import icons.
import "./module-icons";

// Register Faktencheck Search module with DIVI.
addAction(
  "divi.moduleLibrary.registerModuleLibraryStore.after",
  "vvp/factCheckSearch",
  () => {
    registerModule(factCheckSearch.metadata, omit(factCheckSearch, "metadata"));
  },
);

// Register Content Overview module with DIVI.
addAction(
  "divi.moduleLibrary.registerModuleLibraryStore.after",
  "vvp/contentOverview",
  () => {
    registerModule(contentOverview.metadata, omit(contentOverview, "metadata"));
  },
);

// Register Author Profile module with DIVI.
addAction(
  "divi.moduleLibrary.registerModuleLibraryStore.after",
  "vvp/authorProfile",
  () => {
    registerModule(authorProfile.metadata, omit(authorProfile, "metadata"));
  },
);

// Register Trending Items module with DIVI.
addAction(
  "divi.moduleLibrary.registerModuleLibraryStore.after",
  "vvp/trendingItems",
  () => {
    registerModule(trendingItems.metadata, omit(trendingItems, "metadata"));
  },
);

// Register Trending List module with DIVI.
addAction(
  "divi.moduleLibrary.registerModuleLibraryStore.after",
  "vvp/trendingList",
  () => {
    registerModule(trendingList.metadata, omit(trendingList, "metadata"));
  },
);

// Register Related Items module with DIVI.
addAction(
  "divi.moduleLibrary.registerModuleLibraryStore.after",
  "vvp/relatedItems",
  () => {
    registerModule(relatedItems.metadata, omit(relatedItems, "metadata"));
  },
);

// Register Campaign Progress module with DIVI.
addAction(
  "divi.moduleLibrary.registerModuleLibraryStore.after",
  "vvp/campaignProgress",
  () => {
    registerModule(
      campaignProgress.metadata,
      omit(campaignProgress, "metadata"),
    );
  },
);

// Register Campaign Donate module with DIVI.
addAction(
  "divi.moduleLibrary.registerModuleLibraryStore.after",
  "vvp/campaignDonate",
  () => {
    registerModule(campaignDonate.metadata, omit(campaignDonate, "metadata"));
  },
);

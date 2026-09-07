import { addFilter } from "@wordpress/hooks";
import * as factCheckSearchIcon from "./icons/fact-check-search";
import * as contentOverviewIcon from "./icons/content-overview";
import * as authorProfileIcon from "./icons/author-profile";
import * as trendingItemsIcon from "./icons/trending-items";
import * as relatedItemsIcon from "./icons/related-items";
import * as campaignProgressIcon from "./icons/campaign-progress";
import * as campaignDonateIcon from "./icons/campaign-donate";
import * as ctaBoxIcon from "./icons/cta-box";

// Add module icons to the icon library.
addFilter("divi.iconLibrary.icon.map", "vvp/divi5", (icons) => {
  return {
    ...icons,
    [factCheckSearchIcon.name]: factCheckSearchIcon,
    [contentOverviewIcon.name]: contentOverviewIcon,
    [authorProfileIcon.name]: authorProfileIcon,
    [trendingItemsIcon.name]: trendingItemsIcon,
    [relatedItemsIcon.name]: relatedItemsIcon,
    [campaignProgressIcon.name]: campaignProgressIcon,
    [campaignDonateIcon.name]: campaignDonateIcon,
    [ctaBoxIcon.name]: ctaBoxIcon,
  };
});

import { type Metadata, type ModuleLibrary } from "@divi/types";

import metadata from "./module.json";
import { CampaignDonateEdit } from "./edit";
import { type CampaignDonateAttrs } from "./types";
import { placeholderContent } from "./placeholder-content";

import "./style.css";
import "./module.css";

export const campaignDonate: ModuleLibrary.Module.RegisterDefinition<CampaignDonateAttrs> =
  {
    metadata: metadata as Metadata.Values<CampaignDonateAttrs>,
    placeholderContent,
    renderers: {
      edit: CampaignDonateEdit,
    },
  };

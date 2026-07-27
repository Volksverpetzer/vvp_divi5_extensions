import { type Metadata, type ModuleLibrary } from "@divi/types";

import metadata from "./module.json";
import { CampaignProgressEdit } from "./edit";
import { type CampaignProgressAttrs } from "./types";
import { placeholderContent } from "./placeholder-content";

import "./style.scss";
import "./module.scss";

export const campaignProgress: ModuleLibrary.Module.RegisterDefinition<CampaignProgressAttrs> =
  {
    metadata: metadata as Metadata.Values<CampaignProgressAttrs>,
    placeholderContent,
    renderers: {
      edit: CampaignProgressEdit,
    },
  };

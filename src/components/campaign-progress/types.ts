import { type ModuleLibrary } from "@divi/types";

export interface CampaignProgressAttrs {
  module: object;
  summaryApiUrl: object;
  goal: object;
  donateUrl: object;
  donateLabel: object;
}

export type CampaignProgressEditProps =
  ModuleLibrary.Module.Component.EditProps<CampaignProgressAttrs>;

export interface CampaignSummary {
  totalRaised: number;
  goal?: number;
}

export interface CampaignProgressAppProps {
  total: number;
  goal: number;
  donateUrl?: string;
  donateLabel?: string;
  /** When set, the component fetches this URL itself and polls for updates. */
  apiUrl?: string;
}

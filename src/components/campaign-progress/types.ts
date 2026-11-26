import { type ModuleLibrary } from "@divi/types";

export interface CampaignProgressAttrs {
  module: object;
  summaryApiUrl: object;
  goal: object;
  headline: object;
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
  /**
   * A goal explicitly configured in the Divi module. When set, polling
   * never overwrites the displayed goal with whatever the campaign API
   * reports — the Divi field always wins.
   */
  goalOverride?: number;
  /** When set, the component fetches this URL itself and polls for updates. */
  apiUrl?: string;
  /**
   * Shown above the bar. {gesammelt}, {ziel}, {fehlt} and {prozent} are
   * filled with the bar's current amounts (see headline.ts).
   */
  headline?: string;
}

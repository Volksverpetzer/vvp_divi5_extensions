import React, { type ReactElement } from "react";
import { ModuleContainer } from "@divi/module";
import { type CampaignDonateEditProps } from "./types";
import { ModuleStyles } from "./styles";
import { moduleClassnames } from "./module-classnames";
import { ModuleScriptData } from "./module-script-data";
import { CampaignDonateApp } from "./App";
import "./style.scss";

const parsePresets = (input: string): number[] => {
  const values = input
    .split(",")
    .map((value) => Number(value.trim()))
    .filter((value) => Number.isFinite(value) && value > 0);
  return values.length > 0 ? values : [10, 50, 100];
};

export const CampaignDonateEdit = (
  props: CampaignDonateEditProps,
): ReactElement => {
  const { attrs, elements, id, name } = props;

  // Text fields declared with attrName "<name>.innerContent" in module.json
  // store their value under attrs.<name>.innerContent.desktop.value, not
  // attrs.<name>.desktop.value.
  const apiBaseUrl =
    (attrs as any).apiBaseUrl?.innerContent?.desktop?.value?.trim() ?? "";
  const campaignKey =
    (attrs as any).campaignKey?.innerContent?.desktop?.value?.trim() ?? "";
  const stripePublicKey =
    (attrs as any).stripePublicKey?.innerContent?.desktop?.value?.trim() ?? "";
  const paypalClientId =
    (attrs as any).paypalClientId?.innerContent?.desktop?.value?.trim() ?? "";
  const presetsInput =
    (attrs as any).presets?.innerContent?.desktop?.value?.trim() ?? "10,50,100";
  const certificateUrl =
    (attrs as any).certificateUrl?.innerContent?.desktop?.value?.trim() ?? "";

  return (
    <ModuleContainer
      attrs={attrs}
      elements={elements}
      id={id}
      name={name}
      stylesComponent={ModuleStyles}
      classnamesFunction={moduleClassnames}
      scriptDataComponent={ModuleScriptData}
    >
      {elements.styleComponents({ attrName: "module" })}

      {/* Explicitly set the module wrapper class here rather than relying
          on Divi's ModuleContainer to apply it (via classnamesFunction) to
          its own outer element — in the Visual Builder editor that outer
          class is unreliable, sometimes replaced by an auto-generated
          "preset--group--...--divi-background--default" class instead, so
          .vvp-campaign-donate-scoped selectors in style.scss never matched. */}
      <div className="vvp-campaign-donate">
        {/* Preview: inert form, no network calls in the builder. */}
        <CampaignDonateApp
          apiBaseUrl={apiBaseUrl}
          campaignKey={campaignKey}
          stripePublicKey={stripePublicKey}
          paypalClientId={paypalClientId}
          presets={parsePresets(presetsInput)}
          certificateUrl={certificateUrl}
          preview
        />
      </div>
    </ModuleContainer>
  );
};

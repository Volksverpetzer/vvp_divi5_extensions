import React, { type ReactElement } from "react";
import { ModuleContainer } from "@divi/module";
import { type CampaignDonateEditProps } from "./types";
import { ModuleStyles } from "./styles";
import { moduleClassnames } from "./module-classnames";
import { ModuleScriptData } from "./module-script-data";
import { CampaignDonateApp } from "./App";

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
  const presetsInput =
    (attrs as any).presets?.innerContent?.desktop?.value?.trim() ?? "10,50,100";
  const certificateUrl =
    (attrs as any).certificateUrl?.innerContent?.desktop?.value?.trim() ?? "";

  const missingConfig =
    apiBaseUrl === "" || campaignKey === "" || stripePublicKey === "";

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

      {/* Preview: inert form, no network calls in the builder. */}
      <CampaignDonateApp
        apiBaseUrl={apiBaseUrl}
        campaignKey={campaignKey}
        stripePublicKey={stripePublicKey}
        presets={parsePresets(presetsInput)}
        certificateUrl={certificateUrl}
        preview
      />

      {missingConfig && (
        <div className="vvp-cd__config-hint">
          <p>
            <strong>Konfiguration unvollständig.</strong> Bitte Kampagnen-API
            Basis-URL, Kampagnen-Kennung und Stripe Publishable Key in den
            Moduleinstellungen eintragen, bevor das Modul live geschaltet wird.
          </p>
        </div>
      )}
    </ModuleContainer>
  );
};

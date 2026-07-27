import React, { type ReactElement } from "react";
import { ModuleContainer } from "@divi/module";
import { type CampaignProgressEditProps } from "./types";
import { ModuleStyles } from "./styles";
import { moduleClassnames } from "./module-classnames";
import { ModuleScriptData } from "./module-script-data";
import { CampaignProgressApp } from "./App";
import { DEFAULT_GOAL_EUR, DEFAULT_DONATE_LABEL } from "./constants";

export const CampaignProgressEdit = (
  props: CampaignProgressEditProps,
): ReactElement => {
  const { attrs, elements, id, name } = props;

  // Text fields declared with attrName "<name>.innerContent" in module.json
  // store their value under attrs.<name>.innerContent.desktop.value, not
  // attrs.<name>.desktop.value.
  const summaryApiUrl =
    (attrs as any).summaryApiUrl?.innerContent?.desktop?.value?.trim() ?? "";
  const goalInput =
    (attrs as any).goal?.innerContent?.desktop?.value?.trim() ?? "";
  const goal = Number(goalInput) > 0 ? Number(goalInput) : DEFAULT_GOAL_EUR;
  const donateUrl =
    (attrs as any).donateUrl?.innerContent?.desktop?.value?.trim() ?? "";
  const donateLabel =
    (attrs as any).donateLabel?.innerContent?.desktop?.value?.trim() ||
    DEFAULT_DONATE_LABEL;

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

      {/* Preview: static placeholder values, no live network call in the builder. */}
      <CampaignProgressApp
        total={Math.round(goal * 0.42)}
        goal={goal}
        donateUrl={donateUrl}
        donateLabel={donateLabel}
      />

      {summaryApiUrl === "" && (
        <div className="vvp-cp__config-hint">
          <p>
            <strong>Keine Fortschritts-API URL gesetzt.</strong> Die Vorschau
            zeigt fiktive Werte. Tragen Sie in den Moduleinstellungen die URL
            des Kampagnen-Endpunkts ein.
          </p>
        </div>
      )}
    </ModuleContainer>
  );
};

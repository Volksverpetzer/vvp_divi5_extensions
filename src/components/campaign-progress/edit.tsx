import React, { type ReactElement } from "react";
import { ModuleContainer } from "@divi/module";
import { type CampaignProgressEditProps } from "./types";
import { ModuleStyles } from "./styles";
import { moduleClassnames } from "./module-classnames";
import { ModuleScriptData } from "./module-script-data";
import { CampaignProgressApp } from "./App";
import { DEFAULT_GOAL_EUR } from "./constants";

export const CampaignProgressEdit = (
  props: CampaignProgressEditProps,
): ReactElement => {
  const { attrs, elements, id, name } = props;

  // Text fields declared with attrName "<name>.innerContent" in module.json
  // store their value under attrs.<name>.innerContent.desktop.value, not
  // attrs.<name>.desktop.value.
  const goalInput =
    (attrs as any).goal?.innerContent?.desktop?.value?.trim() ?? "";
  const goal = Number(goalInput) > 0 ? Number(goalInput) : DEFAULT_GOAL_EUR;

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

      {/* Explicitly add the module wrapper class so CSS selectors like
          .vvp-campaign-progress .vvp-cp__amounts work in the Divi VB editor.
          Divi's ModuleContainer does not reliably apply classnamesFunction
          when StyleContainer is combined with a stateful component. */}
      <div className="vvp-campaign-progress">
        {/* Preview: static placeholder values, no live network call in the builder. */}
        <CampaignProgressApp total={Math.round(goal * 0.5)} goal={goal} />

        <div className="vvp-cp__config-hint">
          <p>Die Vorschau zeigt keine echten Werte.</p>
        </div>
      </div>
    </ModuleContainer>
  );
};

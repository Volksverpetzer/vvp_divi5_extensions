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

      {/* Explicitly set the module wrapper class here rather than relying
          on Divi's ModuleContainer to apply it (via classnamesFunction) to
          its own outer element — in the Visual Builder editor that outer
          class is unreliable, sometimes replaced by an auto-generated
          "preset--group--...--divi-background--default" class instead, so
          .vvp-campaign-progress-scoped selectors in style.css never matched. */}
      <div className="vvp-campaign-progress">
        {/* Preview: static placeholder values, no live network call in the builder. */}
        <CampaignProgressApp total={Math.round(goal * 0.5)} goal={goal} />
      </div>
    </ModuleContainer>
  );
};

import React, { type ReactElement } from "react";
import { StyleContainer, type StylesProps } from "@divi/module";
import { type CampaignProgressAttrs } from "./types";

export const ModuleStyles = ({
  elements,
  settings,
  mode,
  state,
  noStyleTag,
}: StylesProps<CampaignProgressAttrs>): ReactElement => {
  return (
    <StyleContainer mode={mode} state={state} noStyleTag={noStyleTag}>
      {elements.style({
        attrName: "module",
        styleProps: {
          disabledOn: {
            disabledModuleVisibility: settings?.disabledModuleVisibility,
          },
        },
      })}
    </StyleContainer>
  );
};

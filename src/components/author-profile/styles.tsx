import React, { type ReactElement } from "react";
import { StyleContainer, type StylesProps } from "@divi/module";
import { type AuthorProfileAttrs } from "./types";

export const ModuleStyles = ({
  elements,
  settings,
  mode,
  state,
  noStyleTag,
}: StylesProps<AuthorProfileAttrs>): ReactElement => {
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

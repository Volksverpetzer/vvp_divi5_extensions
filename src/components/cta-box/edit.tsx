import React, { type ReactElement } from "react";
import { ModuleContainer } from "@divi/module";
import {
  type CtaBoxEditProps,
  type CtaBoxIcon,
  type CtaBoxVariant,
} from "./types";
import { ModuleStyles } from "./styles";
import { moduleClassnames } from "./module-classnames";
import { ModuleScriptData } from "./module-script-data";
import { CtaBoxApp } from "./App";
import { DEFAULT_ICON, DEFAULT_VARIANT } from "./constants";

export const CtaBoxEdit = (props: CtaBoxEditProps): ReactElement => {
  const { attrs, elements, id, name } = props;
  const a = attrs as any;

  const icon = (a.icon?.innerContent?.desktop?.value ||
    DEFAULT_ICON) as CtaBoxIcon;
  const heading = a.heading?.innerContent?.desktop?.value ?? "";
  const text = a.text?.innerContent?.desktop?.value ?? "";
  const buttonLabel = a.buttonLabel?.innerContent?.desktop?.value ?? "";
  const buttonUrl = a.buttonUrl?.innerContent?.desktop?.value ?? "";
  const buttonNewTab =
    (a.buttonNewTab?.innerContent?.desktop?.value ?? "off") !== "off";
  const variant = (a.variant?.innerContent?.desktop?.value ||
    DEFAULT_VARIANT) as CtaBoxVariant;

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

      <CtaBoxApp
        icon={icon}
        heading={heading}
        text={text}
        buttonLabel={buttonLabel}
        buttonUrl={buttonUrl}
        buttonNewTab={buttonNewTab}
        variant={variant}
      />
    </ModuleContainer>
  );
};

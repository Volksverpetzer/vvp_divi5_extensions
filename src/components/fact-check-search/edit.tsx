// External Dependencies.
import React, { ReactElement } from "react";

// Divi Dependencies.
import { ModuleContainer } from "@divi/module";

// Local Dependencies.
import { FactCheckSearchEditProps } from "./types";
import { ModuleStyles } from "./styles";
import { moduleClassnames } from "./module-classnames";
import { ModuleScriptData } from "./module-script-data";
import { DEFAULT_API_URLS } from "./constants";
import { FactCheckSearchApp } from "./App";

// Search icon SVG (inline, no external dependency)
// Shield check icon SVG

/**
 * FactCheckSearch edit component for Visual Builder.
 * Renders a static preview of the Faktencheck search bar.
 *
 * @since 1.0.0
 */
export const FactCheckSearchEdit = (
  props: FactCheckSearchEditProps,
): ReactElement => {
  const { attrs, elements, id, name } = props;

  // Text fields declared with attrName "<name>.innerContent" in module.json
  // store their value under attrs.<name>.innerContent.desktop.value, not
  // attrs.<name>.desktop.value — see PR #105.
  const searchApiUrl =
    (attrs as any).searchApiUrl?.innerContent?.desktop?.value ||
    DEFAULT_API_URLS.searchApiUrl;
  const importApiUrl =
    (attrs as any).importApiUrl?.innerContent?.desktop?.value ||
    DEFAULT_API_URLS.importApiUrl;

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

      {/* Preview: full React App */}
      <FactCheckSearchApp
        searchApiUrl={searchApiUrl}
        importApiUrl={importApiUrl}
      />
    </ModuleContainer>
  );
};

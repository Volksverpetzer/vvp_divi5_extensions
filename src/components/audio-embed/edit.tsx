import React, { type ReactElement } from "react";
import { ModuleContainer } from "@divi/module";
import { type AudioEmbedEditProps } from "./types";
import { ModuleStyles } from "./styles";
import { moduleClassnames } from "./module-classnames";
import { ModuleScriptData } from "./module-script-data";
import { AudioEmbedApp } from "./App";

export const AudioEmbedEdit = (props: AudioEmbedEditProps): ReactElement => {
  const { attrs, elements, id, name } = props;

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

      {/*
        No real per-post slug is available while editing a Theme Builder
        template (it isn't bound to one specific article), and
        vvp_wp_audio_converter's "not yet available" state deliberately
        renders nothing visible -- a live iframe against a fake slug here
        just left the module looking empty with no indication it's even
        there. Static preview mockup instead (see App.tsx), same "preview"
        prop convention CampaignDonate/CampaignProgress use for the same
        no-real-data-in-the-builder problem.
      */}
      <AudioEmbedApp slug="" audioBaseUrl="" preview />
    </ModuleContainer>
  );
};

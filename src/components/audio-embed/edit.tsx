import React, { type ReactElement } from "react";
import { ModuleContainer } from "@divi/module";
import { type AudioEmbedEditProps } from "./types";
import { ModuleStyles } from "./styles";
import { moduleClassnames } from "./module-classnames";
import { ModuleScriptData } from "./module-script-data";
import { AudioEmbedApp } from "./App";
import { DEFAULT_AUDIO_BASE_URL } from "./constants";

export const AudioEmbedEdit = (props: AudioEmbedEditProps): ReactElement => {
  const { attrs, elements, id, name } = props;

  // Fields declared with attrName "<name>.innerContent" in module.json store
  // their value under attrs.<name>.innerContent.desktop.value, not
  // attrs.<name>.desktop.value — see PR #105.
  const audioBaseUrl =
    (attrs as any).audioBaseUrl?.innerContent?.desktop?.value ||
    DEFAULT_AUDIO_BASE_URL;

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
        template (it isn't bound to one specific article) -- this example
        slug shows the real not-found/player behavior against whichever
        base URL is configured, same live-iframe approach ContentOverview's
        PodcastBanner/YouTubeBanner already use in the editor.
      */}
      <AudioEmbedApp slug="beispiel-artikel" audioBaseUrl={audioBaseUrl} />
    </ModuleContainer>
  );
};

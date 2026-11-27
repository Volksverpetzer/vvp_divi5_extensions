import React, { type ReactElement } from "react";
import { ModuleContainer } from "@divi/module";
import { type ShareLinkEditProps } from "./types";
import { ModuleStyles } from "./styles";
import { moduleClassnames } from "./module-classnames";
import { ModuleScriptData } from "./module-script-data";
import { ShareLinkApp } from "./App";
import { safeShareUrl } from "./share-url";
import { DEFAULT_QR_LABEL, DEFAULT_TITLE } from "./constants";

export const ShareLinkEdit = (props: ShareLinkEditProps): ReactElement => {
  const { attrs, elements, id, name } = props;
  const a = attrs as any;

  const title = a.title?.innerContent?.desktop?.value || DEFAULT_TITLE;
  const text = a.text?.innerContent?.desktop?.value ?? "";
  const url = a.url?.innerContent?.desktop?.value ?? "";
  const qrLabel = a.qrLabel?.innerContent?.desktop?.value || DEFAULT_QR_LABEL;

  // The VB app window shows the page itself; the pathname drops `?et_fb=1`.
  const fallback = window.location.origin + window.location.pathname;

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

      <ShareLinkApp
        title={title}
        text={text}
        url={safeShareUrl(url, fallback)}
        qrLabel={qrLabel}
        track={false}
      />
    </ModuleContainer>
  );
};

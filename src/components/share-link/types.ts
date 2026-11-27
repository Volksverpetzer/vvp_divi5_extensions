import { type ModuleLibrary } from "@divi/types";

export interface ShareLinkAttrs {
  module: object;
  title: object;
  text: object;
  url: object;
  qrLabel: object;
}

export type ShareLinkEditProps =
  ModuleLibrary.Module.Component.EditProps<ShareLinkAttrs>;

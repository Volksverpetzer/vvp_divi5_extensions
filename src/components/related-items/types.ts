import { type ModuleLibrary } from "@divi/types";

export interface RelatedItemsAttrs {
  module: object;
}

export type RelatedItemsEditProps =
  ModuleLibrary.Module.Component.EditProps<RelatedItemsAttrs>;

// External Dependencies.
import { type ModuleLibrary } from "@divi/types";

// Module attributes interface.
export interface FactCheckSearchAttrs {
  module: object;
  searchApiUrl: object;
  importApiUrl: object;
}

// Edit component props.
export type FactCheckSearchEditProps =
  ModuleLibrary.Module.Component.EditProps<FactCheckSearchAttrs>;

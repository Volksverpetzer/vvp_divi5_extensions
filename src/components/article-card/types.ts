import { type ModuleLibrary } from "@divi/types";

export interface ArticleCardAttrs {
  module: object;
  hero: object;
}

export type ArticleCardEditProps =
  ModuleLibrary.Module.Component.EditProps<ArticleCardAttrs>;

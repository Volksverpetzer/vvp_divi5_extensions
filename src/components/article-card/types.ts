import { type ModuleLibrary } from "@divi/types";

export interface ArticleCardAttrs {
  module: object;
  // attrName "hero.innerContent" in module.json: Divi stores the toggle's
  // value under hero.innerContent.<breakpoint>.value — see PR #105.
  hero?: {
    innerContent?: { desktop?: { value?: "on" | "off" } };
  };
}

export type ArticleCardEditProps =
  ModuleLibrary.Module.Component.EditProps<ArticleCardAttrs>;

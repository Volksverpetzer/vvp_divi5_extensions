import React, { type ReactElement } from "react";
import { ModuleContainer } from "@divi/module";
import { type ArticleCardEditProps } from "./types";
import { ModuleStyles } from "./styles";
import { moduleClassnames } from "./module-classnames";
import { ModuleScriptData } from "./module-script-data";
import { ArticleCard } from "../shared/ArticleCard";
import { FEED_ARTICLES } from "../shared/previewFixtures";

// The Visual Builder doesn't resolve the loop's post for third-party
// modules, so every looped instance previews the same placeholder article.
const PREVIEW_ARTICLE = { ...FEED_ARTICLES[0], author: "Minka Fellstein" };

export const ArticleCardEdit = (props: ArticleCardEditProps): ReactElement => {
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
      <ArticleCard {...PREVIEW_ARTICLE} />
    </ModuleContainer>
  );
};

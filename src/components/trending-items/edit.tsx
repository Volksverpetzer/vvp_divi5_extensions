import React, { type ReactElement } from "react";
import { ModuleContainer } from "@divi/module";
import { type TrendingItemsEditProps } from "./types";
import { ModuleStyles } from "./styles";
import { moduleClassnames } from "./module-classnames";
import { ModuleScriptData } from "./module-script-data";
import { ArticleCard, type ArticleCardProps } from "../shared/ArticleCard";

const PLACEHOLDER_ARTICLES: ArticleCardProps[] = [
  { title: "Faktencheck: Beispielartikel 1", link: "#", date: "23.04.2026", source: "volksverpetzer" },
  { title: "Faktencheck: Beispielartikel 2", link: "#", date: "22.04.2026", source: "volksverpetzer" },
  { title: "Faktencheck: Beispielartikel 3", link: "#", date: "21.04.2026", source: "volksverpetzer" },
];

export const TrendingItemsEdit = (
  props: TrendingItemsEditProps,
): ReactElement => {
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

      <div className="vvp-ti__editor-preview">
        <div className="vvp-ti__editor-notice">
          Vorschau — im Frontend werden echte Trending-Daten geladen.
        </div>
        <div className="vvp-ti__list">
          {PLACEHOLDER_ARTICLES.map((article) => (
            <div key={article.link + article.title} className="vvp-ti__item">
              <ArticleCard {...article} />
            </div>
          ))}
        </div>
      </div>
    </ModuleContainer>
  );
};

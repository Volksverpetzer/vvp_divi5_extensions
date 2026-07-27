import React, { type ReactElement } from "react";
import { ModuleContainer } from "@divi/module";
import { type RelatedItemsEditProps } from "./types";
import { ModuleStyles } from "./styles";
import { moduleClassnames } from "./module-classnames";
import { ModuleScriptData } from "./module-script-data";
import { ArticleCard, type ArticleCardProps } from "../shared/ArticleCard";
import { catPlaceholderImage as img } from "../shared/catPlaceholder";

const PLACEHOLDER_ARTICLES: ArticleCardProps[] = [
  {
    title: "Warum Katzenfotos mehr zählen als politische Argumente",
    excerpt:
      "Fell-Checker arbeiten täglich daran, Fehlinformationen über Katzen zu widerlegen, bevor sie sich weiter verbreiten.",
    link: "#",
    date: "17.05.2026",
    reading_time: 4,
    category: "Analyse",
    category_link: "#",
    source: "volksverpetzer",
    image_url: img("passend1"),
  },
  {
    title: "Schmusekatze oder Schreibtischtäter: Eine kritische Bilanz",
    excerpt: "Wie flauschige Narrative in den Mainstream gelangen.",
    link: "#",
    date: "16.05.2026",
    reading_time: 6,
    category: "Politik",
    category_link: "#",
    source: "volksverpetzer",
    image_url: img("passend2"),
  },
  {
    title: "Katzenfutter: Was stimmt wirklich an den Nährwerten?",
    excerpt:
      "Der Fell-Check zur aktuellen Debatte über Trocken- versus Nassfutter.",
    link: "#",
    date: "15.05.2026",
    reading_time: 3,
    category: "Faktencheck",
    source: "volksverpetzer",
    image_url: img("passend3"),
  },
];

export const RelatedItemsEdit = (
  props: RelatedItemsEditProps,
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

      <div className="vvp-related-items">
        <div className="vvp-ri__editor-notice">
          Zeigt zur Laufzeit bis zu 3 von vectorcrawl empfohlene Artikel für den
          aktuellen Beitrag. Platzhalter im Builder.
        </div>
        <div className="vvp-ri__list">
          {PLACEHOLDER_ARTICLES.map((article) => (
            <div key={article.link + article.title} className="vvp-ri__item">
              <ArticleCard {...article} />
            </div>
          ))}
        </div>
      </div>
    </ModuleContainer>
  );
};

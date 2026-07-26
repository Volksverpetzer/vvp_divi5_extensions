import React, { type ReactElement } from "react";
import { ModuleContainer } from "@divi/module";
import { type RelatedItemsEditProps } from "./types";
import { ModuleStyles } from "./styles";
import { moduleClassnames } from "./module-classnames";
import { ModuleScriptData } from "./module-script-data";
import { ArticleCard, type ArticleCardProps } from "../shared/ArticleCard";

const PLACEHOLDER_ARTICLES: ArticleCardProps[] = [
  {
    title: "Warum Fakten mehr zählen als Gefühle",
    excerpt:
      "Eine Analyse der häufigsten Desinformationsmuster in sozialen Netzwerken.",
    link: "#",
    date: "17.05.2026",
    reading_time: 4,
    category: "Analyse",
    category_link: "#",
    source: "volksverpetzer",
    image_url:
      "https://via.placeholder.com/640x360/e5e7eb/a3a3a3?text=Passend+1",
  },
  {
    title: "AfD und die Medien: Eine Bilanz",
    excerpt: "Wie rechte Narrative in den Mainstream gelangen.",
    link: "#",
    date: "16.05.2026",
    reading_time: 6,
    category: "Politik",
    category_link: "#",
    source: "volksverpetzer",
    image_url:
      "https://via.placeholder.com/640x360/e5e7eb/a3a3a3?text=Passend+2",
  },
  {
    title: "Klimaschutz: Was stimmt wirklich?",
    excerpt:
      "Der Faktencheck zur aktuellen politischen Debatte über Emissionsziele.",
    link: "#",
    date: "15.05.2026",
    reading_time: 3,
    category: "Faktencheck",
    source: "volksverpetzer",
    image_url:
      "https://via.placeholder.com/640x360/e5e7eb/a3a3a3?text=Passend+3",
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

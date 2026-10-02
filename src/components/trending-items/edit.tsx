import React, { type ReactElement } from "react";
import { ModuleContainer } from "@divi/module";
import { type TrendingItemsEditProps } from "./types";
import { ModuleStyles } from "./styles";
import { moduleClassnames } from "./module-classnames";
import { ModuleScriptData } from "./module-script-data";
import { ArticleCard, type ArticleCardProps } from "../shared/ArticleCard";
import { catPlaceholderImage as img } from "../shared/catPlaceholder";

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
    image_url: img("trending1"),
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
    image_url: img("trending2"),
  },
  {
    title: "Klimaschutz: Was stimmt wirklich?",
    excerpt:
      "Der Faktencheck zur aktuellen politischen Debatte über Emissionsziele.",
    link: "#",
    date: "15.05.2026",
    reading_time: 3,
    category: "Faktencheck",
    source: "pruefpunkt",
    image_url: img("trending3"),
  },
];

export const TrendingItemsEdit = (
  props: TrendingItemsEditProps,
): ReactElement => {
  const { attrs, elements, id, name } = props;
  const a = attrs as any;
  // Mirror RenderCallbackTrait.php: off unless explicitly "on", and trim
  // before falling back to "Trending".
  const showHeadline = a.showHeadline?.innerContent?.desktop?.value === "on";
  const headlineText =
    (a.headline?.innerContent?.desktop?.value ?? "").trim() || "Trending";

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

      <div className="vvp-trending-items">
        {showHeadline && (
          <h2 className="vvp-ti__section-title">
            {headlineText}
            {/* Lucide "arrow-up-right" — keep in sync with HEADLINE_ICON in RenderCallbackTrait.php */}
            <svg
              className="vvp-ti__section-icon"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              focusable="false"
            >
              <path d="M7 7h10v10" />
              <path d="M7 17 17 7" />
            </svg>
          </h2>
        )}
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

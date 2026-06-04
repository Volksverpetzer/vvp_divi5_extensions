import React, { type ReactElement } from "react";
import { ModuleContainer } from "@divi/module";
import { type TrendingListEditProps, type TrendingListItem } from "./types";
import { ModuleStyles } from "./styles";
import { moduleClassnames } from "./module-classnames";
import { ModuleScriptData } from "./module-script-data";

const PLACEHOLDER_ITEMS: TrendingListItem[] = [
  {
    title:
      "Bärbel Bas hat RECHT: Aber Tagesthemen stimmen NIUS, BILD & AfD zu!?",
    link: "#",
    date: "8. Mai 2026",
    author: "Thomas Laschyk",
  },
  {
    title: "75 % wollen KEINEN AfD-Kanzler: Wie die WELT für die AfD lügt",
    link: "#",
    date: "7. Mai 2026",
    author: "Thomas Laschyk",
  },
  {
    title: "Faktencheck: Beispielartikel",
    link: "#",
    date: "6. Mai 2026",
    author: "Thomas Laschyk",
  },
];

export const TrendingListEdit = (
  props: TrendingListEditProps,
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

      <div className="vvp-trending-list">
        <div className="vvp-tl__list">
          {PLACEHOLDER_ITEMS.map((item) => (
            <div key={item.link + item.title} className="vvp-tl__item">
              <a href={item.link} className="vvp-tl__title">
                {item.title}
              </a>
              <span className="vvp-tl__meta">
                von {item.author} | {item.date}
              </span>
            </div>
          ))}
        </div>
      </div>
    </ModuleContainer>
  );
};

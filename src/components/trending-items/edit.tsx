import React, { type ReactElement } from "react";
import { ModuleContainer } from "@divi/module";
import { type TrendingItemsEditProps, type TrendingItem } from "./types";
import { ModuleStyles } from "./styles";
import { moduleClassnames } from "./module-classnames";
import { ModuleScriptData } from "./module-script-data";
import { TrendingItemsApp } from "./App";

const PLACEHOLDER_ITEMS: TrendingItem[] = [
  { title: "Faktencheck: Beispielartikel 1", url: "#", thumbnailUrl: "", type: "post", pageviews: 4200 },
  { title: "Faktencheck: Beispielartikel 2", url: "#", thumbnailUrl: "", type: "post", pageviews: 3800 },
  { title: "Faktencheck: Beispielartikel 3", url: "#", thumbnailUrl: "", type: "post", pageviews: 2900 },
  { title: "Faktencheck: Beispielartikel 4", url: "#", thumbnailUrl: "", type: "post", pageviews: 2100 },
  { title: "Faktencheck: Beispielartikel 5", url: "#", thumbnailUrl: "", type: "post", pageviews: 1750 },
];

export const TrendingItemsEdit = (
  props: TrendingItemsEditProps,
): ReactElement => {
  const { attrs, elements, id, name } = props;

  const showThumbnail = (attrs as any).showThumbnail?.desktop?.value !== "off";

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
        <TrendingItemsApp
          items={PLACEHOLDER_ITEMS}
          showThumbnail={showThumbnail}
        />
      </div>
    </ModuleContainer>
  );
};

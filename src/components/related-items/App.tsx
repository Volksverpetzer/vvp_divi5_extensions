import * as React from "react";
import { ArticleCard, type ArticleCardProps } from "../shared/ArticleCard";

// Visual Builder preview and Storybook only. On the site, RelatedItems's
// RenderCallbackTrait.php renders this same list server-side, with each card
// hydrated by content-overview-frontend.js — keep the two in sync.
interface RelatedItemsAppProps {
  items: ArticleCardProps[];
}

export const RelatedItemsApp = ({ items }: RelatedItemsAppProps) => {
  if (!items.length) {
    return null;
  }
  return (
    <div className="vvp-ri__list">
      {items.map((props) => (
        <div key={props.link + props.title} className="vvp-ri__item">
          <ArticleCard {...props} trackingContext="related" />
        </div>
      ))}
    </div>
  );
};

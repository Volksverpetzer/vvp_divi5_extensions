import * as React from "react";
import { ArticleCard, type ArticleCardProps } from "../shared/ArticleCard";

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
        <div key={props.link} className="vvp-ri__item">
          <ArticleCard {...props} trackingContext="related" />
        </div>
      ))}
    </div>
  );
};

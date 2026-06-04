import { type ModuleLibrary } from "@divi/types";

export interface TrendingListAttrs {
  module: object;
  range: object;
}

export type TrendingListEditProps =
  ModuleLibrary.Module.Component.EditProps<TrendingListAttrs>;

export interface TrendingListItem {
  title: string;
  link: string;
  date: string;
  author: string;
}

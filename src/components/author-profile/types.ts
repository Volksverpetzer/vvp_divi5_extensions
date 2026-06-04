import { type ModuleLibrary } from "@divi/types";

export interface Author {
  name: string;
  bio: string;
  avatarUrl: string;
  profileUrl: string;
}

export interface AuthorProfileAttrs {
  module: object;
  showAvatar: object;
  showBio: object;
  showLink: object;
  layout: object;
  avatarSize: object;
  nameFont: object;
  bioFont: object;
}

export type AuthorProfileEditProps =
  ModuleLibrary.Module.Component.EditProps<AuthorProfileAttrs>;

export type Layout = "vertical" | "horizontal";

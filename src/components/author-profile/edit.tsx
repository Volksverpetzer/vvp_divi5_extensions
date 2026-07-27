import React, { type ReactElement } from "react";
import { ModuleContainer } from "@divi/module";
import { type AuthorProfileEditProps, type Author, type Layout } from "./types";
import { ModuleStyles } from "./styles";
import { moduleClassnames } from "./module-classnames";
import { ModuleScriptData } from "./module-script-data";
import { AuthorProfileApp } from "./App";

const PLACEHOLDER_AUTHORS: Author[] = [
  {
    name: "Max Mustermann",
    bio: "Journalist und Faktenchecker bei Volksverpetzer. Schreibt über Desinformation, Medien und Demokratie.",
    avatarUrl:
      "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&s=150",
    profileUrl: "#",
  },
];

export const AuthorProfileEdit = (
  props: AuthorProfileEditProps,
): ReactElement => {
  const { attrs, elements, id, name } = props;

  // Fields declared with attrName "<name>.innerContent" in module.json store
  // their value under attrs.<name>.innerContent.desktop.value, not
  // attrs.<name>.desktop.value — see PR #105.
  const showAvatar =
    (attrs as any).showAvatar?.innerContent?.desktop?.value !== "off";
  const showBio =
    (attrs as any).showBio?.innerContent?.desktop?.value !== "off";
  const showLink =
    (attrs as any).showLink?.innerContent?.desktop?.value !== "off";
  const layout = ((attrs as any).layout?.innerContent?.desktop?.value ??
    "vertical") as Layout;
  const avatarSize =
    parseInt(
      (attrs as any).avatarSize?.innerContent?.desktop?.value ?? "200",
      10,
    ) || 200;

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

      <div className="vvp-ap__editor-preview">
        <AuthorProfileApp
          authors={PLACEHOLDER_AUTHORS}
          showAvatar={showAvatar}
          showBio={showBio}
          showLink={showLink}
          layout={layout}
          avatarSize={avatarSize}
        />
      </div>
    </ModuleContainer>
  );
};

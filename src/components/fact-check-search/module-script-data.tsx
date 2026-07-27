import React from "react";
import { type Module } from "@divi/types";
import { DEFAULT_API_URLS } from "./constants";

interface ScriptDataAttrs {
  searchApiUrl?: { innerContent?: { desktop?: { value?: string } } };
  importApiUrl?: { innerContent?: { desktop?: { value?: string } } };
}

export const ModuleScriptData = (
  props: Module.ModuleScriptDataProps<object>,
) => {
  const attrs = props.attrs as ScriptDataAttrs | undefined;

  const searchApiUrl =
    attrs?.searchApiUrl?.innerContent?.desktop?.value ||
    DEFAULT_API_URLS.searchApiUrl;
  const importApiUrl =
    attrs?.importApiUrl?.innerContent?.desktop?.value ||
    DEFAULT_API_URLS.importApiUrl;

  return (
    <script type="application/json" id="vvp-fact-check-search-config">
      {JSON.stringify({
        searchApiUrl: searchApiUrl,
        importApiUrl: importApiUrl,
      })}
    </script>
  );
};

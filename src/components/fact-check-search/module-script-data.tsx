import { type ModuleLibrary } from "@divi/types";
import { type FactCheckSearchAttrs } from "./types";
import { DEFAULT_API_URLS } from "./constants";

export const ModuleScriptData = (
  props: ModuleLibrary.Module.ScriptData.CustomScriptDataProps<FactCheckSearchAttrs>,
) => {
  const { attrs } = props;

  // Get configured URLs or use defaults
  const searchApiUrl =
    (attrs as any).searchApiUrl?.desktop?.value ??
    DEFAULT_API_URLS.searchApiUrl;
  const importApiUrl =
    (attrs as any).importApiUrl?.desktop?.value ??
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

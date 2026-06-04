// Ambient stubs for @divi/types peer dependencies that are not installed.
// @divi/types ships TypeScript source and imports from AI/editor packages
// that are not needed by this project.

declare module "@langchain/core/language_models/base" {
  export type LanguageModelLike = any;
}
declare module "@langchain/core/messages" {
  export type AIMessage = any;
  export type AIMessageChunk = any;
  export type ToolMessage = any;
}
declare module "@langchain/core/tools" {
  export type DynamicStructuredToolInput<_T = any, _U = any, _V = any> = object;

  export type DynamicStructuredTool<
    _T = any,
    _U = any,
    _V = any,
    _W = any,
  > = object;
  export type StructuredToolInterface = any;
}
declare module "@langchain/langgraph/web" {
  export type Command = any;

  export type CompiledStateGraph<
    _TS = any,
    _TU = any,
    _TN extends string = string,
  > = object;
}
declare module "@langchain/langgraph-checkpoint" {
  export type BaseCheckpointSaver = any;
}
declare module "zod" {
  namespace z {
    type ZodTypeAny = any;

    type output<_T> = any;

    type input<_T> = any;

    type infer<_T> = any;
  }
  export { z };
}
declare module "@tinymce/tinymce-react" {
  export type Editor = any;
}

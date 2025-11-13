import type { LoaderContext } from "../utils/useLoaderContext";

export type AsyncLoader<Result, Arg = void> = (
  context: LoaderContext,
  arg: Arg
) => Promise<Result>;

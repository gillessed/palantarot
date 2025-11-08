import { LoaderContext } from "./useLoaderContext";

export type AsyncLoader<Result, Arg = void> = (context: LoaderContext, arg: Arg) => Promise<Result>;
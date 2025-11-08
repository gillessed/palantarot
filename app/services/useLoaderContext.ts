import { useMemo } from "react";
import { ServerApi } from "../api/serverApi";
import { useApi } from "../apiProvider";

export interface LoaderContext {
  api: ServerApi;
}

export function useLoaderContext(): LoaderContext {
  const api = useApi();
  return useMemo(() => ({ api }), [api]);
}
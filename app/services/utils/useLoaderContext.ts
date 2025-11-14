import { useMemo } from "react";
import { ServerApi } from "../apis/serverApi";
import { useApi } from "../../context/ApiContext";

export interface LoaderContext {
  api: ServerApi;
}

export function useLoaderContext(): LoaderContext {
  const api = useApi();
  return useMemo(() => ({ api }), [api]);
}

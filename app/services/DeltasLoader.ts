import { DeltasRequest } from "../../server/api/StatsService";
import { Deltas } from "../../server/model/Delta";
import { AsyncLoader } from "./AsyncLoader";
import { LoaderContext } from "./useLoaderContext";

export const DefaultDeltaLoad = 10;

const DeltasPath = "/stats/deltas";
export const DeltasLoader: AsyncLoader<Deltas, DeltasRequest> = async (
  { api }: LoaderContext,
  request: DeltasRequest
) => {
  return api.wrapPost<Deltas>(DeltasPath, request);
};

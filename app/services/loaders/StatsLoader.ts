import type { Stats } from "../../../server/model/Stats";
import type { LoaderContext } from "../utils/useLoaderContext";
import { AsyncLoader } from "./AsyncLoader";

const StatsPath = "/stats";
export const StatsLoader: AsyncLoader<Stats, void> = async ({
  api,
}: LoaderContext) => {
  return api.wrapGet<Stats>(StatsPath);
};

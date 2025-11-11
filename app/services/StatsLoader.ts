
import { Stats } from "../../server/model/Stats";
import { AsyncLoader } from "./AsyncLoader";
import { LoaderContext } from "./useLoaderContext";

const StatsPath = "/stats";
export const StatsLoader: AsyncLoader<Stats, void> = async ({ api }: LoaderContext) => {
    return api.wrapGet<Stats>(StatsPath);
}
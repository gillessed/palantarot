import { Month } from "../../server/model/Month";
import { Result } from "../../server/model/Result";
import { AsyncLoader } from "./AsyncLoader";
import { LoaderContext } from "./useLoaderContext";

const RecentGamesPath = "/game/month";
export const ResultsLoader: AsyncLoader<Result[], Month> = async ({ api }: LoaderContext, month: Month) => {
    return api.wrapPost<Result[]>(RecentGamesPath, month);
}

import { RecentGameQuery } from "../../server/db/GameRecordQuerier";
import { GameRecord } from "../../server/model/GameRecord";
import { AsyncLoader } from "./AsyncLoader";
import { LoaderContext } from "./useLoaderContext";

const RecentGamesPath = "/game/recent";
export const RecentGamesLoader: AsyncLoader<GameRecord[], RecentGameQuery> = async ({ api }: LoaderContext, query: RecentGameQuery) => {
    return api.wrapPost<GameRecord[]>(RecentGamesPath, query);
}

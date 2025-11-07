import { useCallback } from "react";
import { RecentGameQuery } from "../../server/db/GameRecordQuerier";
import { GameRecord } from "../../server/model/GameRecord";
import { useApi } from "../apiProvider";
import { AsyncLoader } from "./useAsync";

const RecentGamesPath = "/game/recent";

export function useRecentGamesLoader(): AsyncLoader<GameRecord[], RecentGameQuery> {
  const api = useApi();
  return useCallback(async (query: RecentGameQuery) => {
    return api.wrapPost<GameRecord[]>(RecentGamesPath, query);
  }, [api]);
}

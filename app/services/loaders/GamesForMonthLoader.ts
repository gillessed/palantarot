import { GameRecord } from "../../server/model/GameRecord";
import { Month } from "../../server/model/Month";
import { AsyncLoader } from "./AsyncLoader";
import { LoaderContext } from "./useLoaderContext";

const GamesForMonthPath = `/game/month/all`;
export const GamesForMonthLoader: AsyncLoader<GameRecord[], Month> = async (
  { api }: LoaderContext,
  month: Month
) => {
  return api.wrapPost<GameRecord[]>(GamesForMonthPath, month);
};

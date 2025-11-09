import { GameRecord } from "../../server/model/GameRecord";
import { AsyncLoader } from "./AsyncLoader";
import { LoaderContext } from "./useLoaderContext";

const GamePath = (gameId: string) => `/game/${gameId}`;
export const GameLoader: AsyncLoader<GameRecord, string> = async (
  { api }: LoaderContext,
  gameId: string
) => {
  return api.wrapGet<GameRecord>(GamePath(gameId));
};

import { useCallback } from "react";
import { GameRecord } from "../../server/model/GameRecord";
import { useApi } from "../apiProvider";
import { useAsync } from "./useAsync";

const SaveGamePath = "/game/save";

export function useSaveGame(onComplete?: () => void) {
  const api = useApi();
  const loader = useCallback(async (newGame: GameRecord) => {
    return api.wrapPost<void>(SaveGamePath, newGame);
  }, [api]);

  return useAsync(loader, onComplete);
}

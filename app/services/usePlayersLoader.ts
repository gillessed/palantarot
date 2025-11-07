import { useCallback } from "react";
import { Player } from "../../server/model/Player";
import { mapFromCollection } from "../../server/utils";
import { useApi } from "../apiProvider";
import { AsyncLoader } from "./useAsync";

const PlayersPath = "/players";

export function usePlayersLoader(): AsyncLoader<Map<string, Player>> {
  const api = useApi();
  return useCallback(async () => {
    return api.wrapGet<Player[]>(PlayersPath).then((players) => {
      return mapFromCollection(players, "id");
    });
  }, [api]);
}

import { useCallback } from "react";
import { NewPlayer, Player } from "../../../server/model/Player";
import { useApi } from "../../context/ApiContext";
import { useAsync } from "../utils/useAsync";

const AddPlayerPath = "/players/add";

export function useAddPlayer(onComplete?: (result: Player) => void) {
  const api = useApi();
  const loader = useCallback(
    async (newPlayer: NewPlayer) => {
      return api.wrapPost<Player>(AddPlayerPath, newPlayer);
    },
    [api]
  );

  return useAsync(loader, onComplete);
}

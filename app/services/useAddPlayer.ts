import { useMemo, useState } from "react";
import { NewPlayer, Player } from "../../server/model/Player";
import { useApi } from "../apiProvider";
import { Async, asyncError, asyncLoaded, asyncLoading, asyncUnloaded } from "../utils/Async";

const AddPlayerPath = "/players/add";

export function useAddPlayer(onComplete?: (result: Player) => void) {
  const api = useApi();
  const [addedPlayer, setAddedPlayer] = useState<Async<Player>>(asyncUnloaded());

  const addPlayer = useMemo(() => {
    return async function (newPlayer: NewPlayer) {
      setAddedPlayer(asyncLoading());
      try {
        const result = await api.wrapPost<Player>(AddPlayerPath, newPlayer);
        setAddedPlayer(asyncLoaded(result));
        onComplete?.(result);
      } catch (error) {
        setAddedPlayer(asyncError(error));
      }
    };
  }, [api]);

  return { addedPlayer, addPlayer };
}

import { useCallback } from "react";
import { useApi } from "../../context/ApiContext";
import { useAsync } from "../utils/useAsync";

const DeleteGamePath = "/game/delete";

export function useDeleteGame(onComplete?: () => void) {
  const api = useApi();
  const loader = useCallback(
    async (gameId: string) => {
      return api.wrapPost<void>(DeleteGamePath, { gameId });
    },
    [api]
  );

  return useAsync(loader, onComplete);
}

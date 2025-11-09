import { useCallback } from "react";
import { useApi } from "../apiProvider";
import { useAsync } from "./useAsync";

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

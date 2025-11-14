import { useCallback } from "react";
import { useApi } from "../../context/ApiContext";
import { useAsync } from "../utils/useAsync";
import { NewRoomArgs } from "../../../server/play/room/NewRoomArgs";

const CreateRoomPath = "/play/new_room";

export function useCreateRoom(onComplete?: (result: string) => void) {
  const api = useApi();
  const loader = useCallback(
    async (settings: NewRoomArgs): Promise<string> => {
      return api.wrapPost(CreateRoomPath, settings);
    },
    [api]
  );

  return useAsync(loader, onComplete);
}

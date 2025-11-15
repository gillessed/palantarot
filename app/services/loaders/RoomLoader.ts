import type {
  RoomDescription
} from "../../../server/play/room/RoomDescription";
import type { LoaderContext } from "../utils/useLoaderContext";
import type { AsyncLoader } from "./AsyncLoader";

const LobbyPath = "/play/rooms";
export const RoomLoader: AsyncLoader<RoomDescription, string> = async ({
  api,
}: LoaderContext, roomId: string) => {
  const rooms = await api.wrapGet<{
    [key: string]: RoomDescription;
  }>(LobbyPath);
  const room = rooms[roomId];
  if (room == null) {
    throw Error("No such room with id " + roomId);
  }
  return room;
};

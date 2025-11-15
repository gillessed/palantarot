import type {
  RoomDescription,
  RoomDescriptions,
} from "../../../server/play/room/RoomDescription";
import { objectToMap } from "../../../server/utils";
import type { LoaderContext } from "../utils/useLoaderContext";
import type { AsyncLoader } from "./AsyncLoader";

const LobbyPath = "/play/rooms";
export const LobbyLoader: AsyncLoader<RoomDescriptions> = async ({
  api,
}: LoaderContext) => {
  const descriptionsObject = await api.wrapGet<{
    [key: string]: RoomDescription;
  }>(LobbyPath);
  return objectToMap(descriptionsObject) ?? new Map();
};

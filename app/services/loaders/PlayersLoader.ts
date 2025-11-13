import type { Player } from "../../../server/model/Player";
import { mapFromCollection } from "../../../server/utils";
import type { LoaderContext } from "../utils/useLoaderContext";
import { AsyncLoader } from "./AsyncLoader";

const PlayersPath = "/players";
export const PlayersLoader: AsyncLoader<Map<string, Player>, void> = async ({
  api,
}: LoaderContext) => {
  return api.wrapGet<Player[]>(PlayersPath).then((players) => {
    return mapFromCollection(players, "id");
  });
};

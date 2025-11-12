import type { Streak } from "../../server/model/Streak";
import { AsyncLoader } from "./AsyncLoader";
import { LoaderContext } from "./useLoaderContext";

const StreaksPath = "/stats/streaks";
export const StreaksLoader: AsyncLoader<Streak[], void> = async ({
  api,
}: LoaderContext) => {
  return api.wrapGet<Streak[]>(StreaksPath);
};

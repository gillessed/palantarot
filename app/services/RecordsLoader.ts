import type { Records } from "../../server/model/Records";
import type { AsyncLoader } from "./AsyncLoader";
import type { LoaderContext } from "./useLoaderContext";

const RecordsPath = "/game/records";
export const RecordsLoader: AsyncLoader<Records> = async ({
  api,
}: LoaderContext) => {
  return api.wrapGet<Records>(RecordsPath);
};

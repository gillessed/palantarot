import type { BidRequest, BidStats } from "../../server/model/Bid";
import { AsyncLoader } from "./AsyncLoader";
import { LoaderContext } from "./useLoaderContext";

const BidsPath = "/stats/bids";
export const BidsLoader: AsyncLoader<BidStats, BidRequest> = async (
  { api }: LoaderContext,
  request: BidRequest
) => {
  return api.wrapPost<BidStats>(BidsPath, request);
};

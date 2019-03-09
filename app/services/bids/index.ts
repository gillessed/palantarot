import { Loadable } from './../redux/loadable';
import { ServerApi } from './../../api/serverApi';
import { generatePropertyService } from '../redux/serviceGenerator';
import { PropertyDispatcher } from '../redux/serviceDispatcher';
import { BidRequest, BidStats } from '../../../server/model/Bid';
import { ReduxState } from '../rootReducer';
import { Loader } from '../loader';
import { Dispatchers } from '../dispatchers';

export type BidsService = Loadable<BidRequest, BidStats>;

const bidsService = generatePropertyService<BidRequest, BidStats>('BIDS',
  (api: ServerApi) => {
    return (request: BidRequest) => {
      return api.getBids(request);
    }
  }
);

export const bidsActions = bidsService.actions;
export const BidsDispatcher = bidsService.dispatcher;
export type BidsDispatcher = PropertyDispatcher<BidRequest>;
export const bidsReducer = bidsService.reducer.build();
export const bidsSaga = bidsService.saga;
export const bidsLoader: Loader<ReduxState, BidRequest, BidStats> = {
  get: (state: ReduxState, _: BidRequest) => state.bids,
  load: (dispatchers: Dispatchers, request: BidRequest) => dispatchers.bids.request(request),
};

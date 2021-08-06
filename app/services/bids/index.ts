import {BidRequest, BidStats} from '../../../server/model/Bid';
import {Dispatchers} from '../dispatchers';
import {Loader} from '../loader';
import {PropertyDispatcher} from '../redux/serviceDispatcher';
import {generatePropertyService} from '../redux/serviceGenerator';
import {ReduxState} from '../rootReducer';
import {ServerApi} from './../../api/serverApi';
import {Loadable} from './../redux/loadable';

export type BidsService = Loadable<BidRequest, BidStats>;

const bidsService = generatePropertyService<BidRequest, BidStats>(
  'bids',
  (api: ServerApi) => {
    return (request: BidRequest) => {
      return api.getBids(request);
    };
  }
);

export const bidsActions = bidsService.actions;
export const BidsDispatcher = bidsService.dispatcher;
export type BidsDispatcher = PropertyDispatcher<BidRequest>;
export const bidsReducer = bidsService.reducer.build();
export const bidsSaga = bidsService.saga;
export const bidsLoader: Loader<ReduxState, BidRequest, BidStats> = {
  get: (state: ReduxState, _: BidRequest) => state.bids,
  load: (dispatchers: Dispatchers, request: BidRequest, force?: boolean) =>
    dispatchers.bids.request(request, force),
};

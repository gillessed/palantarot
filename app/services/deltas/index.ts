import { DeltasRequest } from '../../../server/api/StatsService';
import { Deltas } from '../../../server/model/Delta';
import { Dispatchers } from '../dispatchers';
import { Loader } from '../loader';
import { PropertyDispatcher } from '../redux/serviceDispatcher';
import { generatePropertyService } from '../redux/serviceGenerator';
import { ReduxState } from '../rootReducer';
import { ServerApi } from './../../api/serverApi';
import { Loadable } from './../redux/loadable';

export type DeltasService = Loadable<DeltasRequest, Deltas>;

const deltasService = generatePropertyService<DeltasRequest, Deltas>('deltas',
  (api: ServerApi) => {
    return (request: DeltasRequest) => {
      return api.getDeltas(request);
    }
  }
);

export const deltasActions = deltasService.actions;
export const DeltasDispatcher = deltasService.dispatcher;
export type DeltasDispatcher = PropertyDispatcher<DeltasRequest>;
export const deltasReducer = deltasService.reducer.build();
export const deltasSaga = deltasService.saga;
export const deltasLoader: Loader<ReduxState, DeltasRequest, Deltas> = {
  get: (state: ReduxState, _: DeltasRequest) => state.deltas,
  load: (dispatchers: Dispatchers, request: DeltasRequest, force?: boolean) => dispatchers.deltas.request(request, force),
};

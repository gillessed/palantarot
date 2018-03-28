import { Loadable } from './../redux/loadable';
import { ServerApi } from './../../api/serverApi';
import { generatePropertyService } from '../redux/serviceGenerator';
import { PropertyDispatcher } from '../redux/serviceDispatcher';
import { DeltasRequest } from '../../../server/api/StatsService';
import { Deltas } from '../../../server/model/Delta';

export type DeltasService = Loadable<DeltasRequest, Deltas>;

const deltasService = generatePropertyService<DeltasRequest, Deltas>('DELTAS',
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
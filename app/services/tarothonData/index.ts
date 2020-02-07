import { LoadableCache } from './../redux/loadable';
import { ServerApi } from './../../api/serverApi';
import { generateService, identityMapper } from '../redux/serviceGenerator';
import { ServiceDispatcher } from '../redux/serviceDispatcher';
import { ReduxState } from '../rootReducer';
import { Loader } from '../loader';
import { Dispatchers } from '../dispatchers';
import { TarothonData } from '../../../server/model/Tarothon';
import { wrapAsBatchCall } from '../redux/utils';

export type TarothonDataService = LoadableCache<string, TarothonData>;

const tarothonDataService = generateService<string, TarothonData>('TAROTHON DATA',
  (api: ServerApi) => {
    return (tarothonIds: string[]) => {
      return wrapAsBatchCall((tarothonId: string) => {
        return api.getTarothon(tarothonId);
      })(tarothonIds);
    }
  },
  identityMapper,
);

export const tarothonDataActions = tarothonDataService.actions;
export const TarothonDataDispatcher = tarothonDataService.dispatcher;
export type TarothonDataDispatcher = ServiceDispatcher<string>;
export const tarothonDataReducer = tarothonDataService.reducer.build();
export const tarothonDataSaga = tarothonDataService.saga;
export const tarothonDataLoader: Loader<ReduxState, string, TarothonData> = {
  get: (state: ReduxState, arg: string) => state.tarothonData.get(arg),
  load: (dispatchers: Dispatchers, arg: string, force?: boolean) => dispatchers.tarothonData.requestSingle(arg, force),
};

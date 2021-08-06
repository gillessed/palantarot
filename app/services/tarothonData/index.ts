import {TarothonData} from '../../../server/model/Tarothon';
import {Dispatchers} from '../dispatchers';
import {Loader} from '../loader';
import {ServiceDispatcher} from '../redux/serviceDispatcher';
import {generateService, identityMapper} from '../redux/serviceGenerator';
import {wrapAsBatchCall} from '../redux/utils';
import {ReduxState} from '../rootReducer';
import {ServerApi} from './../../api/serverApi';
import {LoadableCache} from './../redux/loadable';

export type TarothonDataService = LoadableCache<string, TarothonData>;

const tarothonDataService = generateService<string, TarothonData>(
  'tarothonData',
  (api: ServerApi) => {
    return (tarothonIds: string[]) => {
      return wrapAsBatchCall((tarothonId: string) => {
        return api.getTarothon(tarothonId);
      })(tarothonIds);
    };
  },
  identityMapper
);

export const tarothonDataActions = tarothonDataService.actions;
export const TarothonDataDispatcher = tarothonDataService.dispatcher;
export type TarothonDataDispatcher = ServiceDispatcher<string>;
export const tarothonDataReducer = tarothonDataService.reducer.build();
export const tarothonDataSaga = tarothonDataService.saga;
export const tarothonDataLoader: Loader<ReduxState, string, TarothonData> = {
  get: (state: ReduxState, arg: string) => state.tarothonData.get(arg),
  load: (dispatchers: Dispatchers, arg: string, force?: boolean) =>
    dispatchers.tarothonData.requestSingle(arg, force),
};

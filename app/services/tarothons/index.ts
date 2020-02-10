import { Loadable } from './../redux/loadable';
import { ServerApi } from './../../api/serverApi';
import { Player } from './../../../server/model/Player';
import { generatePropertyService } from '../redux/serviceGenerator';
import { PropertyDispatcher } from '../redux/serviceDispatcher';
import { ReduxState } from '../rootReducer';
import { Loader } from '../loader';
import { Dispatchers } from '../dispatchers';
import { Tarothon } from '../../../server/model/Tarothon';

export type TarothonsService = Loadable<void, Tarothon[]>;

const tarothonsService = generatePropertyService<void, Tarothon[]>('TAROTHON',
  (api: ServerApi) => {
    return () => {
      return api.getTarothons();
    }
  }
);

export const tarothonsActions = tarothonsService.actions;
export const TarothonsDispatcher = tarothonsService.dispatcher;
export type TarothonsDispatcher = PropertyDispatcher<void>;
export const tarothonsReducer = tarothonsService.reducer.build();
export const tarothonsSaga = tarothonsService.saga;
export const tarothonsLoader: Loader<ReduxState, void, Tarothon[]> = {
  get: (state: ReduxState, _: undefined) => state.tarothons,
  load: (dispatchers: Dispatchers, _: undefined, force?: boolean) => dispatchers.tarothons.request(undefined, force),
};

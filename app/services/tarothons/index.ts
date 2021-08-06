import {Tarothon} from '../../../server/model/Tarothon';
import {Dispatchers} from '../dispatchers';
import {Loader} from '../loader';
import {PropertyDispatcher} from '../redux/serviceDispatcher';
import {generatePropertyService} from '../redux/serviceGenerator';
import {ReduxState} from '../rootReducer';
import {ServerApi} from './../../api/serverApi';
import {Loadable} from './../redux/loadable';

export type TarothonsService = Loadable<void, Tarothon[]>;

const tarothonsService = generatePropertyService<void, Tarothon[]>(
  'tarothon',
  (api: ServerApi) => {
    return () => {
      return api.getTarothons();
    };
  }
);

export const tarothonsActions = tarothonsService.actions;
export const TarothonsDispatcher = tarothonsService.dispatcher;
export type TarothonsDispatcher = PropertyDispatcher<void>;
export const tarothonsReducer = tarothonsService.reducer.build();
export const tarothonsSaga = tarothonsService.saga;
export const tarothonsLoader: Loader<ReduxState, void, Tarothon[]> = {
  get: (state: ReduxState, _: void) => state.tarothons,
  load: (dispatchers: Dispatchers, _: void | void[], force?: boolean) =>
    dispatchers.tarothons.request(undefined, force),
};

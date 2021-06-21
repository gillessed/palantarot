import { Records } from '../../../server/model/Records';
import { Dispatchers } from '../dispatchers';
import { Loader } from '../loader';
import { PropertyDispatcher } from '../redux/serviceDispatcher';
import { generatePropertyService } from '../redux/serviceGenerator';
import { ReduxState } from '../rootReducer';
import { ServerApi } from './../../api/serverApi';
import { Loadable } from './../redux/loadable';

export type RecordsService = Loadable<void, Records>;

const recordsService = generatePropertyService<void, Records>('records',
  (api: ServerApi) => {
    return () => {
      return api.getRecords();
    }
  }
);

export const recordsActions = recordsService.actions;
export const RecordsDispatcher = recordsService.dispatcher;
export type RecordsDispatcher = PropertyDispatcher<void>;
export const recordsReducer = recordsService.reducer.build();
export const recordsSaga = recordsService.saga;
export const recordsLoader: Loader<ReduxState, void, Records> = {
  get: (state: ReduxState, _: void) => state.records,
  load: (dispatchers: Dispatchers, _: undefined, force?: boolean) => dispatchers.records.request(undefined, force),
};

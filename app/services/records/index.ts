import { Loadable } from './../redux/loadable';
import { ServerApi } from './../../api/serverApi';
import { generatePropertyService } from '../redux/serviceGenerator';
import { PropertyDispatcher } from '../redux/serviceDispatcher';
import { Records } from '../../../server/model/Records';
import { ReduxState } from '../rootReducer';
import { Loader } from '../loader';
import { Dispatchers } from '../dispatchers';

export type RecordsService = Loadable<void, Records>;

const recordsService = generatePropertyService<void, Records>('RECORDS',
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
  load: (dispatchers: Dispatchers, _: undefined) => dispatchers.records.request(undefined),
};

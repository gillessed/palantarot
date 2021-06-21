import { Dispatchers } from '../dispatchers';
import { Loader } from '../loader';
import { LoadableCache } from '../redux/loadable';
import { ServiceDispatcher } from '../redux/serviceDispatcher';
import { generateService, identityMapper } from '../redux/serviceGenerator';
import { ReduxState } from '../rootReducer';
import { Month } from './../../../server/model/Month';
import { Result } from './../../../server/model/Result';
import { ServerApi } from './../../api/serverApi';

export type ResultsService = LoadableCache<Month, Result[]>;

const resultsService = generateService<Month, Result[]>('results',
  (api: ServerApi) => {
    return (months: Month[]) => {
      return api.getResults(months[0]).then((result: Result[]) => {
        return new Map<Month, Result[]>([[months[0], result]]);
      });
    }
  },
  identityMapper,
);

export const resultsActions = resultsService.actions;
export const ResultsDispatcher = resultsService.dispatcher;
export type ResultsDispatcher = ServiceDispatcher<Month>;
export const resultsReducer = resultsService.reducer.build();
export const resultsSaga = resultsService.saga;
export const resultsLoader: Loader<ReduxState, Month, Result[]> = {
  get: (state: ReduxState, arg: Month) => state.results.get(arg),
  load: (dispatchers: Dispatchers, arg: Month, force?: boolean) => dispatchers.results.requestSingle(arg, force),
}

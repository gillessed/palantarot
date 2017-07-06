import { Month } from './../../../server/model/Month';
import { Result } from './../../../server/model/Result';
import { ServerApi } from './../../api/serverApi';
import { generateService } from '../redux/serviceGenerator';
import { ServiceDispatcher } from '../redux/serviceDispatcher';
import { LoadableCache } from '../redux/loadable';

export type ResultsService = LoadableCache<Month, Result[]>;

const resultsService = generateService<Month, Result[]>('RESULTS',
  (api: ServerApi) => {
    return (months: Month[]) => {
      return api.getResults(months[0]).then((result: Result[]) => {
        return new Map<Month, Result[]>([[months[0], result]]);
      });
    }
  }
);

export const resultsActions = resultsService.actions;
export const ResultsDispatcher = resultsService.dispatcher;
export type ResultsDispatcher = ServiceDispatcher<Month>;
export const resultsReducer = resultsService.reducer.build();
export const resultsSaga = resultsService.saga;
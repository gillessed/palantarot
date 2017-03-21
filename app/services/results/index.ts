import { Month } from './../../../server/model/Month';
import { Result } from './../../../server/model/Result';
import { Loadable } from './../redux/loadable';
import { ServerApi } from './../../api/serverApi';
import { generatePropertyService } from '../redux/serviceGenerator';

export type ResultsService = Loadable<Result[]>;

const resultsService = generatePropertyService<Month, Result[]>('RESULTS',
  (api: ServerApi) => {
    return (month: Month) => {
      return api.getResults(month);
    }
  }
);

export const resultsActions = resultsService.actions;
export const resultsActionCreators = resultsService.actionCreators;
export const resultsReducer = resultsService.reducer;
export const resultsSaga = resultsService.saga;
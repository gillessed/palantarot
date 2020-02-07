import { Month } from './../../../server/model/Month';
import { Result } from './../../../server/model/Result';
import { ServerApi } from './../../api/serverApi';
import { generateService } from '../redux/serviceGenerator';
import { ServiceDispatcher } from '../redux/serviceDispatcher';
import { LoadableCache } from '../redux/loadable';
import { ReduxState } from '../rootReducer';
import { Dispatchers } from '../dispatchers';
import { Loader } from '../loader';
import { Game } from '../../../server/model/Game';
import { SearchQuery } from '../../../server/model/Search';

export type SearchService = LoadableCache<string, Game[]>;

const searchService = generateService<SearchQuery, Game[], string>(
  'SEARCH',
  (api: ServerApi) => {
    return (queries: SearchQuery[]) => {
      return api.search(queries[0]).then((result: Game[]) => {
        return new Map<SearchQuery, Game[]>([[queries[0], result]]);
      });
    }
  },
  (query: SearchQuery) => query.id,
);

export const searchActions = searchService.actions;
export const SearchDispatcher = searchService.dispatcher;
export type SearchDispatcher = ServiceDispatcher<SearchQuery>;
export const searchReducer = searchService.reducer.build();
export const searchSaga = searchService.saga;
export const searchLoader: Loader<ReduxState, SearchQuery, Game[], string> = {
  get: (state: ReduxState, key: string) => state.search.get(key),
  load: (dispatchers: Dispatchers, arg: SearchQuery, force?: boolean) => dispatchers.search.requestSingle(arg, force),
  argToKey: (searchQuery: SearchQuery) => searchQuery.id,
}

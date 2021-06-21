import { GameRecord } from '../../../server/model/GameRecord';
import { SearchQuery } from '../../../server/model/Search';
import { Dispatchers } from '../dispatchers';
import { Loader } from '../loader';
import { LoadableCache } from '../redux/loadable';
import { ServiceDispatcher } from '../redux/serviceDispatcher';
import { generateService } from '../redux/serviceGenerator';
import { ReduxState } from '../rootReducer';
import { ServerApi } from './../../api/serverApi';

export type SearchService = LoadableCache<string, GameRecord[]>;

const searchOperation = (api: ServerApi) => {
  return (queries: SearchQuery[]) => {
    return api.search(queries[0]).then((result: GameRecord[]) => {
      return new Map<SearchQuery, GameRecord[]>([[queries[0], result]]);
    });
  }
};

const searchService = generateService<SearchQuery, GameRecord[], string>(
  'search',
  searchOperation,
  (query: SearchQuery) => query.id,
);

export const searchActions = searchService.actions;
export const SearchDispatcher = searchService.dispatcher;
export type SearchDispatcher = ServiceDispatcher<SearchQuery>;
export const searchReducer = searchService.reducer.build();
export const searchSaga = searchService.saga;
export const searchLoader: Loader<ReduxState, SearchQuery, GameRecord[], string> = {
  get: (state: ReduxState, key: string) => state.search.get(key),
  load: (dispatchers: Dispatchers, arg: SearchQuery, force?: boolean) => dispatchers.search.requestSingle(arg, force),
  argToKey: (searchQuery: SearchQuery) => searchQuery.id,
}

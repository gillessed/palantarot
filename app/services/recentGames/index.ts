import { Loadable } from './../redux/loadable';
import { ServerApi } from './../../api/serverApi';
import { Game } from './../../../server/model/Game';
import { generatePropertyService } from '../redux/serviceGenerator';
import { PropertyDispatcher } from '../redux/serviceDispatcher';
import { RecentGameQuery } from '../../../server/db/GameQuerier';
import { Loader } from '../loader';
import { ReduxState } from '../rootReducer';
import { Dispatchers } from '../dispatchers';

export type RecentGamesService = Loadable<RecentGameQuery, Game[]>;

const recentGamesService = generatePropertyService<RecentGameQuery, Game[]>('RECENT_GAMES',
  (api: ServerApi) => {
    return (query: RecentGameQuery) => {
      return api.getRecentGames(query);
    }
  }
);

export const recentGamesActions = recentGamesService.actions;
export const RecentGamesDispatcher = recentGamesService.dispatcher;
export type RecentGamesDispatcher = PropertyDispatcher<RecentGameQuery>;
export const recentGamesReducer = recentGamesService.reducer.build();
export const recentGamesSaga = recentGamesService.saga;
export const recentGamesLoader: Loader<ReduxState, RecentGameQuery, Game[]> = {
  get: (state: ReduxState, _: RecentGameQuery) => state.recentGames,
  load: (dispatchers: Dispatchers, query: RecentGameQuery, force?: boolean) => dispatchers.recentGames.request(query, force),
};

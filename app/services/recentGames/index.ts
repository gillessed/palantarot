import { RecentGameQuery } from '../../../server/db/GameRecordQuerier';
import { GameRecord } from '../../../server/model/GameRecord';
import { Dispatchers } from '../dispatchers';
import { Loader } from '../loader';
import { PropertyDispatcher } from '../redux/serviceDispatcher';
import { generatePropertyService } from '../redux/serviceGenerator';
import { ReduxState } from '../rootReducer';
import { ServerApi } from './../../api/serverApi';
import { Loadable } from './../redux/loadable';

export type RecentGamesService = Loadable<RecentGameQuery, GameRecord[]>;

const recentGamesService = generatePropertyService<RecentGameQuery, GameRecord[]>('RECENT_GAMES',
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
export const recentGamesLoader: Loader<ReduxState, RecentGameQuery, GameRecord[]> = {
  get: (state: ReduxState, _: RecentGameQuery) => state.recentGames,
  load: (dispatchers: Dispatchers, query: RecentGameQuery, force?: boolean) => dispatchers.recentGames.request(query, force),
};

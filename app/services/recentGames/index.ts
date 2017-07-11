import { Loadable } from './../redux/loadable';
import { ServerApi } from './../../api/serverApi';
import { Game } from './../../../server/model/Game';
import { generatePropertyService } from '../redux/serviceGenerator';
import { PropertyDispatcher } from '../redux/serviceDispatcher';
import { RecentGameQuery } from '../../../server/db/GameQuerier';

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
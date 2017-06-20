import { Loadable } from './../redux/loadable';
import { ServerApi } from './../../api/serverApi';
import { Game } from './../../../server/model/Game';
import { generatePropertyService } from '../redux/serviceGenerator';

export type RecentGamesService = Loadable<Game[]>;

const recentGamesService = generatePropertyService<number | undefined, Game[]>('RECENT_GAMES',
  (api: ServerApi) => {
    return (count: number | undefined) => {
      return api.getRecentGames(count);
    }
  }
);

export const recentGamesActions = recentGamesService.actions;
export const recentGamesActionCreators = recentGamesService.actionCreators;
export const recentGamesReducer = recentGamesService.reducer.build();
export const recentGamesSaga = recentGamesService.saga;
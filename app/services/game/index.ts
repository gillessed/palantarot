import { Game } from './../../../server/model/Game';
import { LoadableCache } from './../redux/loadable';
import { ServerApi } from './../../api/serverApi';
import { generateService } from '../redux/serviceGenerator';

export type GameService = LoadableCache<Game>;

const gameService = generateService<string, Game>('GAMES',
  (api: ServerApi) => {
    return (gameIds: string[]) => {
      return api.loadGame(gameIds[0]);
    }
  }
);

export const gameActions = gameService.actions;
export const gameActionCreators = gameService.actionCreators;
export const gameReducer = gameService.reducer.build();
export const gameSaga = gameService.saga;
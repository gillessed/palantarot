import { Game } from './../../../server/model/Game';
import { LoadableCache } from './../redux/loadable';
import { ServerApi } from './../../api/serverApi';
import { generateService } from '../redux/serviceGenerator';
import { ServiceDispatcher } from '../redux/serviceDispatcher';
import { wrapAsBatchCall } from '../redux/utils';

export type GameService = LoadableCache<string, Game>;

const gameService = generateService<string, Game>('GAMES',
  (api: ServerApi) => {
    return (gameIds: string[]) => {
      return wrapAsBatchCall((gameId: string) => {
        return api.loadGame(gameId);
      })(gameIds);
    }
  }
);

export const gameActions = gameService.actions;
export const GameDispatcher = gameService.dispatcher;
export type GameDispatcher = ServiceDispatcher<string>;
export const gameReducer = gameService.reducer.build();
export const gameSaga = gameService.saga;
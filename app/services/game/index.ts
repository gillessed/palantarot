import { GameRecord } from '../../../server/model/GameRecord';
import { ServiceDispatcher } from '../redux/serviceDispatcher';
import { generateService, identityMapper } from '../redux/serviceGenerator';
import { wrapAsBatchCall } from '../redux/utils';
import { ServerApi } from './../../api/serverApi';
import { LoadableCache } from './../redux/loadable';

export type GameService = LoadableCache<string, GameRecord>;

const gameService = generateService<string, GameRecord>('GAMES',
  (api: ServerApi) => {
    return (gameIds: string[]) => {
      return wrapAsBatchCall((gameId: string) => {
        return api.loadGame(gameId);
      })(gameIds);
    }
  },
  identityMapper,
);

export const gameActions = gameService.actions;
export const GameDispatcher = gameService.dispatcher;
export type GameDispatcher = ServiceDispatcher<string>;
export const gameReducer = gameService.reducer.build();
export const gameSaga = gameService.saga;

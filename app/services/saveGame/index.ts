import { ServerApi } from './../../api/serverApi';
import { generatePropertyService } from '../redux/serviceGenerator';
import { Game } from '../../../server/model/Game';
import { LoadableCache } from '../redux/loadable';

export type SaveGameService = LoadableCache<void>;

const saveGameService = generatePropertyService<Game, void>('SAVE_GAME',
  (api: ServerApi) => {
    return (newGame: Game) => {
      return api.saveGame(newGame);
    }
  }
);

export const saveGameActions = saveGameService.actions;
export const saveGameActionCreators = saveGameService.actionCreators;
export const saveGameReducer = saveGameService.reducer.build();
export const saveGameSaga = saveGameService.saga;
import { ServerApi } from './../../api/serverApi';
import { generatePropertyService } from '../redux/serviceGenerator';
import { Game } from '../../../server/model/Game';
import { takeEveryTyped, createSagaPropertyOperation } from '../redux/serviceSaga';

const saveGameOperation = 
(api: ServerApi) => {
  return (newGame: Game) => {
    return api.saveGame(newGame);
  }
};

const saveGameService = generatePropertyService<Game, void>('SAVE_GAME', saveGameOperation);

export const saveGameActions = saveGameService.actions;
export const saveGameActionCreators = saveGameService.actionCreators;

export const saveGameSaga = function* (api: ServerApi) {
  yield [
    takeEveryTyped(
      saveGameActions.REQUEST,
      createSagaPropertyOperation(saveGameOperation(api), saveGameActionCreators),
    )
  ];
}
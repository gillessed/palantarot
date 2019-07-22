import { all } from 'redux-saga/effects';
import { Game } from '../../../server/model/Game';
import { Loadable } from '../redux/loadable';
import { PropertyDispatcher } from '../redux/serviceDispatcher';
import { generatePropertyService } from '../redux/serviceGenerator';
import { createSagaPropertyOperation, takeEveryTyped } from '../redux/serviceSaga';
import { ServerApi } from './../../api/serverApi';

export type SaveGameService = Loadable<Game, void>;

const saveGameOperation = (api: ServerApi) => {
  return (newGame: Game) => {
    return api.saveGame(newGame);
  }
};

const saveGameService = generatePropertyService<Game, void>('SAVE_GAME', saveGameOperation);

export const saveGameActions = saveGameService.actions;
export const SaveGameDispatcher = saveGameService.dispatcher;
export type SaveGameDispatcher = PropertyDispatcher<Game>;
export const saveGameReducer = saveGameService.reducer.build();

export const saveGameSaga = function* (api: ServerApi) {
  yield all([
    takeEveryTyped(
      saveGameActions.request,
      createSagaPropertyOperation(saveGameOperation(api), saveGameActions),
    )
  ]);
}

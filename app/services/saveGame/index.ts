import { all, takeEvery } from 'redux-saga/effects';
import { GameRecord } from '../../../server/model/GameRecord';
import { Loadable } from '../redux/loadable';
import { PropertyDispatcher } from '../redux/serviceDispatcher';
import { generatePropertyService } from '../redux/serviceGenerator';
import { createSagaPropertyOperation } from '../redux/serviceSaga';
import { ServerApi } from './../../api/serverApi';

export type SaveGameService = Loadable<GameRecord, void>;

const saveGameOperation = (api: ServerApi) => {
  return (newGame: GameRecord) => {
    return api.saveGame(newGame);
  }
};

const saveGameService = generatePropertyService<GameRecord, void>('SAVE_GAME', saveGameOperation);

export const saveGameActions = saveGameService.actions;
export const SaveGameDispatcher = saveGameService.dispatcher;
export type SaveGameDispatcher = PropertyDispatcher<GameRecord>;
export const saveGameReducer = saveGameService.reducer.build();

export const saveGameSaga = function* (api: ServerApi) {
  yield all([
    takeEvery(
      saveGameActions.request.TYPE,
      createSagaPropertyOperation(saveGameOperation(api), saveGameActions),
    )
  ]);
}

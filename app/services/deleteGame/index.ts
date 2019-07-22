import { all } from 'redux-saga/effects';
import { Loadable } from '../redux/loadable';
import { PropertyDispatcher } from '../redux/serviceDispatcher';
import { generatePropertyService } from '../redux/serviceGenerator';
import { createSagaPropertyOperation, takeEveryTyped } from '../redux/serviceSaga';
import { ServerApi } from './../../api/serverApi';

export type DeleteGameService = Loadable<string, void>;

const deleteGameOperation = (api: ServerApi) => {
  return (gameId: string) => {
    return api.deleteGame(gameId);
  }
};

const deleteGameService = generatePropertyService<string, void>('DELETE GAME', deleteGameOperation);

export const deleteGameActions = deleteGameService.actions;
export const DeleteGameDispatcher = deleteGameService.dispatcher;
export type DeleteGameDispatcher = PropertyDispatcher<string>;
export const deleteGameReducer = deleteGameService.reducer.build();

export const deleteGameSaga = function* (api: ServerApi) {
  yield all([
    takeEveryTyped(
      deleteGameActions.request,
      createSagaPropertyOperation(deleteGameOperation(api), deleteGameActions),
    )
  ]);
}

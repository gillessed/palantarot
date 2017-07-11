import { ServerApi } from './../../api/serverApi';
import { generatePropertyService } from '../redux/serviceGenerator';
import { takeEveryTyped, createSagaPropertyOperation } from '../redux/serviceSaga';
import { PropertyDispatcher } from '../redux/serviceDispatcher';
import { Loadable } from '../redux/loadable';

export type DeleteGameService = Loadable<string, void>;

const deleteGameOperation = (api: ServerApi) => {
  return (gameId: string) => {
    return api.deleteGame(gameId);
  }
};

const deleteGameService = generatePropertyService<string, void>('DELETE_GAME', deleteGameOperation);

export const deleteGameActions = deleteGameService.actions;
export const deleteGameActionCreators = deleteGameService.actionCreators;
export const DeleteGameDispatcher = deleteGameService.dispatcher;
export type DeleteGameDispatcher = PropertyDispatcher<string>;
export const deleteGameReducer = deleteGameService.reducer.build();

export const deleteGameSaga = function* (api: ServerApi) {
  yield [
    takeEveryTyped(
      deleteGameActions.REQUEST,
      createSagaPropertyOperation(deleteGameOperation(api), deleteGameActionCreators),
    )
  ];
}
import { Intent } from '@blueprintjs/core';
import { TypedAction } from 'redoodle';
import { all, fork, put, takeEvery } from 'redux-saga/effects';
import { DebugPlayAction, DebugPlayMessage, PlayAction, PlayError, PlayMessage, PlayUpdates } from '../../../server/play/PlayMessages';
import { Palantoaster } from '../../components/toaster/Toaster';
import history from '../../history';
import { Action, AutoplayActionType, ErrorCode, ErrorEvent } from '../../play/common';
import { StaticRoutes } from '../../routes';
import { createSocketService, MessagePayload } from '../socket/socketService';
import { DebugInGameActions, InGameActions } from './InGameActions';
import { JoinGamePayload } from './InGameTypes';

export const inGameSocketService = createSocketService<JoinGamePayload, PlayMessage>(
  'PLAY',
  (payload: JoinGamePayload) => ({
    type: 'play',
    game: payload.game,
    player: payload.player,
  }),
);

function* handleMessage(action: TypedAction<MessagePayload<JoinGamePayload>>) {
  const { message, metadata } = action.payload;
  if (message.type === 'play_updates') {
    const playUpdates = message as PlayUpdates;
    yield put(InGameActions.playUpdate(playUpdates.events));
  } else if (message.type === 'play_error') {
    const playError = message as PlayError;
    const errorEvent: ErrorEvent = {
      type: 'error',
      error: playError.error,
      errorCode: playError.errorCode,
      private_to: undefined,
    };
    if (errorEvent.errorCode === ErrorCode.DOES_NOT_EXIST) {
      history.push(StaticRoutes.lobby());
      Palantoaster.show({
        message: `Could not find game with id ${metadata.game}`,
        intent: Intent.DANGER,
      });
    }
    yield put(InGameActions.playUpdate([errorEvent]));
  }
}

export function* inGameSaga() {
  yield all([
    takeEvery(inGameSocketService.actions.message.TYPE, handleMessage),
    takeEvery(InGameActions.playAction.TYPE, playActionSaga),
    takeEvery(DebugInGameActions.debugJoinGame.TYPE, debugJoinGameSaga),
    takeEvery(DebugInGameActions.debugPlayAction.TYPE, debugPlayActionSaga),
    takeEvery(DebugInGameActions.autoplay.TYPE, autoplaySaga),
    fork(inGameSocketService.saga),
  ]);
}

function* playActionSaga(action: TypedAction<Action>) {
  const message: PlayAction = {
    type: 'play_action',
    action: action.payload,
  };
  yield put(inGameSocketService.actions.send(message));
}

function* debugJoinGameSaga(action: TypedAction<JoinGamePayload>) {
  const debugMessage: DebugPlayMessage = {
    type: 'debug_play',
    player: action.payload.player,
  };
  yield put(inGameSocketService.actions.send(debugMessage));
}

function* debugPlayActionSaga(action: TypedAction<Action>) {
  const debugMessage: DebugPlayAction = {
    type: 'debug_play_action',
    action: action.payload,
  };
  yield put(inGameSocketService.actions.send(debugMessage));
}

function* autoplaySaga() {
  const autoplayMessage = { type: AutoplayActionType };
  yield put(inGameSocketService.actions.send(autoplayMessage));
}

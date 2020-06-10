import { TypedAction } from 'redoodle';
import { all, call, fork, put, takeEvery } from 'redux-saga/effects';
import { EnterLobbyMessage, LobbyUpdateMessage } from '../../../server/play/LobbyMessages';
import { ServerApi } from '../../api/serverApi';
import { createSocketService, MessagePayload } from '../socket/socketService';
import { LobbyActions } from './LobbyActions';
import { lobbyService } from './LobbyService';

export const lobbySocketService = createSocketService<void, EnterLobbyMessage>(
  'LOBBY',
  () => ({ type: 'lobby' }),
);

function* handleMessage(action: TypedAction<MessagePayload<void>>) {
  const { message } = action.payload;
  if (message.type === 'lobby_update') {
    const update = message as LobbyUpdateMessage;
    yield put(LobbyActions.gameUpdate(update.game));
  }
}

function* newGameSaga(api: ServerApi) {
  yield call(api.playNewGame);
}

export function* lobbySaga(api: ServerApi) {
  yield all([
    takeEvery(LobbyActions.newGame.TYPE, newGameSaga, api),
    takeEvery(lobbySocketService.actions.message.TYPE, handleMessage),
    fork(lobbySocketService.saga),
    fork(lobbyService.saga, api),
  ]);
}

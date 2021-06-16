import { TypedAction } from 'redoodle';
import { all, call, fork, put, takeEvery } from 'redux-saga/effects';
import { LobbySocketMessage, LobbySocketMessageType, RoomUpdatedMessage, RoomUpdatedMessageType } from '../../../server/play/lobby/LobbyMessages';
import { NewRoomArgs } from '../../../server/play/room/NewRoomArgs';
import { buildSocketConnectionMessage, SocketConnectionMessage } from '../../../server/websocket/SocketConnectionMessage';
import { ServerApi } from '../../api/serverApi';
import { createSocketService, MessagePayload } from '../socket/socketService';
import { LobbyActions } from './LobbyActions';
import { lobbyService } from './LobbyService';

export const lobbySocketService = createSocketService<string, SocketConnectionMessage>(
  'LOBBY',
  (socketId: string) => buildSocketConnectionMessage(socketId),
);

function* handleMessage(action: TypedAction<MessagePayload<void>>) {
  const { message } = action.payload;
  if (message.type === LobbySocketMessageType) {
    const lobbyMessage = message as LobbySocketMessage;
    switch (lobbyMessage.messageType) {
      case RoomUpdatedMessageType:
        yield call(handleRoomUpdated, message as RoomUpdatedMessage);
        break;
    }
  }
}

function* handleRoomUpdated(message: RoomUpdatedMessage) {
  yield put(LobbyActions.roomUpdate(message.room));
}

function* newRoomSaga(api: ServerApi, action: TypedAction<NewRoomArgs>) {
  const settings = action.payload;
  yield call(api.createNewRoom, settings);
}

export function* lobbySaga(api: ServerApi) {
  yield all([
    takeEvery(LobbyActions.newRoom.TYPE, newRoomSaga, api),
    takeEvery(lobbySocketService.actions.message.TYPE, handleMessage),
    fork(lobbySocketService.saga),
    fork(lobbyService.saga, api),
  ]);
}

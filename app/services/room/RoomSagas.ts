import { Intent } from '@blueprintjs/core';
import { TypedAction } from 'redoodle';
import { all, call, delay, fork, put, select, takeEvery } from 'redux-saga/effects';
import { ErrorCode } from '../../../server/play/model/GameEvents';
import { GameUpdatesMessage, GameUpdatesMessageType, NewGameMessage, NewGameMessageType, RoomChatMessage, RoomChatMessageType, RoomErrorMessage, RoomErrorMessageType, RoomSocketMessage, RoomSocketMessages, RoomSocketMessageType, RoomStatusMessage, RoomStatusMessageType } from '../../../server/play/room/RoomSocketMessages';
import { buildSocketConnectionMessage, SocketConnectionMessage } from '../../../server/websocket/SocketConnectionMessage';
import { Palantoaster } from '../../components/toaster/Toaster';
import history from '../../history';
import { StaticRoutes } from '../../routes';
import { getGamePlayer } from '../gamePlayer/GamePlayerSelectors';
import { createSocketService, MessagePayload } from '../socket/socketService';
import { ClientGameSelectors } from './ClientGameSelectors';
import { DebugRoomActions, RoomActions } from './RoomActions';
import { RoomSelectors } from './RoomSelectors';

export const roomSocketService = createSocketService<string, SocketConnectionMessage>(
  'ROOM',
  (socketId: string) => buildSocketConnectionMessage(socketId),
);

function* handleMessage(action: TypedAction<MessagePayload<RoomSocketMessage>>) {
  const { message } = action.payload;
  console.log('Received message from server', message);
  if (message.type === RoomSocketMessageType) {
    const roomMessage = message as RoomSocketMessage;
    switch (roomMessage.messageType) {
      case RoomStatusMessageType:
        yield call(handleRoomStatusMessage, roomMessage as RoomStatusMessage);
        break;
      case RoomChatMessageType:
        yield call(handleRoomChatMessage, roomMessage as RoomChatMessage);
        break;
      case GameUpdatesMessageType:
        yield call(handleGameUpdatesMessage, roomMessage as GameUpdatesMessage);
        break;
      case NewGameMessageType:
        yield call(handleNewGameMessage, roomMessage as NewGameMessage);
        break;
      case RoomErrorMessageType:
        yield call(handleRoomErrorMessage, roomMessage as RoomErrorMessage);
        break;
    }
  }
}

export function* handleRoomStatusMessage(message: RoomStatusMessage) {
  const gamePlayer: ReturnType<typeof getGamePlayer> = yield select(getGamePlayer);
  if (gamePlayer != null) {
    yield put(RoomActions.roomStatus({
      playerId: gamePlayer.playerId,
      room: message.room,
    }));
  }
}

export function* handleRoomChatMessage(message: RoomChatMessage) {
  yield put(RoomActions.chatReceived(message.chat));
}

export function* handleGameUpdatesMessage(message: GameUpdatesMessage) {
  yield put(RoomActions.gameUpdate({ gameId: message.gameId, events: message.events }));
  yield call(autoplaySaga);
}

export function* handleNewGameMessage(message: NewGameMessage) {
  yield put(RoomActions.newGameCreated({
    gameSettings: message.settings,
    gameId: message.gameId,
  }));
}

export function* handleRoomErrorMessage(message: RoomErrorMessage) {
  if (message.errorCode === ErrorCode.DOES_NOT_EXIST) {
    console.log('room does not exist');
    history.push(StaticRoutes.lobby());
    Palantoaster.show({
      message: `Could not find room with id ${message.roomId}`,
      intent: Intent.DANGER,
    });
  } else {
    // TODO: surface errors differently.
    // const errorEvent: ErrorEvent = {
    //   type: 'error',
    //   error: message.error,
    //   errorCode: message.errorCode,
    //   privateTo: undefined,
    // };
  }
}

export function* roomSaga() {
  yield all([
    takeEvery(roomSocketService.actions.message.TYPE, handleMessage),
    takeEvery(DebugRoomActions.autoplay.TYPE, autoplaySaga),
    takeEvery(RoomActions.setAutoplay.TYPE, setAutoplaySaga),
    fork(roomSocketService.saga),
  ]);
}


function* autoplaySaga() {
  const room: ReturnType<typeof RoomSelectors.getRoom> = yield select(RoomSelectors.getRoom);
  const roomId = room?.id;
  const game = room?.game;
  const gamePlayer = room?.playerId;
  const autoplay: ReturnType<typeof RoomSelectors.getAutoplay> = yield select(RoomSelectors.getAutoplay);
  if (roomId && game && gamePlayer === game.playState.toPlay && gamePlayer != null && autoplay) {
    yield delay(1000);
    yield put(roomSocketService.actions.send(RoomSocketMessages.autoplay(roomId)));
  }
}

function* setAutoplaySaga() {
  const gameState: ReturnType<typeof ClientGameSelectors.getClientGame> = yield select(ClientGameSelectors.getClientGame);
  const autoplay: ReturnType<typeof RoomSelectors.getAutoplay> = yield select(RoomSelectors.getAutoplay);
  if (!gameState) {
    return;
  }
  const { playerId, playState } = gameState;
  const { toPlay } = playState;
  const isOwnTurn = toPlay != null && toPlay === playerId;
  if (isOwnTurn && autoplay) {
    yield call(autoplaySaga);
  }
}

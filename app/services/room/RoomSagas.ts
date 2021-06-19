import { Intent } from '@blueprintjs/core';
import { TypedAction } from 'redoodle';
import { all, call, delay, put, select, takeEvery } from 'redux-saga/effects';
import { ErrorCode } from '../../../server/play/model/GameEvents';
import { PlayerStatus } from '../../../server/play/room/PlayerStatus';
import { EnterRoomMessagePayload, GameUpdatesMessagePayload, NewGameMessagePayload, RoomChatMessagePayload, RoomErrorMessagePayload, RoomSocketMessages } from '../../../server/play/room/RoomSocketMessages';
import { RoomStatus } from '../../../server/play/room/RoomStatus';
import { SocketMessage } from '../../../server/websocket/SocketMessage';
import { Palantoaster } from '../../components/toaster/Toaster';
import history from '../../history';
import { StaticRoutes } from '../../routes';
import { getGamePlayer } from '../gamePlayer/GamePlayerSelectors';
import { SocketActions } from '../socket/socketService';
import { ClientGameSelectors } from './ClientGameSelectors';
import { DebugRoomActions, RoomActions } from './RoomActions';
import { RoomSelectors } from './RoomSelectors';

function* handleMessage(action: TypedAction<SocketMessage>) {
  const message = action.payload;
  switch (message.type) {
    case RoomSocketMessages.enterRoom.type:
      yield call(handleEnterRoomMessage, message.payload);
      break;
    case RoomSocketMessages.roomStatus.type:
      yield call(handleRoomStatusMessage, message.payload);
      break;
    case RoomSocketMessages.roomChat.type:
      yield call(handleRoomChatMessage, message.payload);
      break;
    case RoomSocketMessages.gameUpdates.type:
      yield call(handleGameUpdatesMessage, message.payload);
      break;
    case RoomSocketMessages.newGame.type:
      yield call(handleNewGameMessage, message.payload);
      break;
    case RoomSocketMessages.error.type:
      yield call(handleRoomErrorMessage, message.payload);
      break;
  }
}

export function* handleEnterRoomMessage(payload: EnterRoomMessagePayload) {
  yield put(RoomActions.setPlayerStatus({ playerId: payload.playerId, playerStatus: PlayerStatus.Online }));
}

export function* handleRoomStatusMessage(payload: RoomStatus) {
  const gamePlayer: ReturnType<typeof getGamePlayer> = yield select(getGamePlayer);
  if (gamePlayer != null) {
    yield put(RoomActions.roomStatus({
      playerId: gamePlayer.playerId,
      room: payload,
    }));
  }
}

export function* handleRoomChatMessage(payload: RoomChatMessagePayload) {
  yield put(RoomActions.chatReceived(payload.chat));
}

export function* handleGameUpdatesMessage(payload: GameUpdatesMessagePayload) {
  yield put(RoomActions.gameUpdate({ gameId: payload.gameId, events: payload.events }));
  yield call(autoplaySaga);
}

export function* handleNewGameMessage(payload: NewGameMessagePayload) {
  yield put(RoomActions.newGameCreated({
    gameSettings: payload.settings,
    gameId: payload.gameId,
  }));
}

export function* handleRoomErrorMessage(payload: RoomErrorMessagePayload) {
  if (payload.errorCode === ErrorCode.DOES_NOT_EXIST) {
    history.push(StaticRoutes.lobby());
    Palantoaster.show({
      message: `Could not find room with id ${payload.roomId}`,
      intent: Intent.DANGER,
    });
  } else {
    // TODO: surface errors
  }
}

export function* roomSaga() {
  yield all([
    takeEvery(SocketActions.message.TYPE, handleMessage),
    takeEvery(DebugRoomActions.autoplay.TYPE, autoplaySaga),
    takeEvery(RoomActions.setAutoplay.TYPE, setAutoplaySaga),
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
    yield put(SocketActions.send(RoomSocketMessages.autoplay({ roomId })));
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

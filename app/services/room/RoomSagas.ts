import {Intent} from '@blueprintjs/core';
import {TypedAction} from 'redoodle';
import {all, call, delay, put, select, takeEvery} from 'redux-saga/effects';
import {BidAction, ErrorCode} from '../../../server/play/model/GameEvents';
import {PlayerStatus} from '../../../server/play/room/PlayerStatus';
import {
  EnterRoomMessagePayload,
  GameUpdatesMessagePayload,
  NewGameMessagePayload,
  NotifyPlayerMessagePayload,
  PlayerStatusUpdatedMessagePayload,
  RoomChatMessagePayload,
  RoomErrorMessagePayload,
  RoomSocketMessages,
} from '../../../server/play/room/RoomSocketMessages';
import {SocketMessage} from '../../../server/websocket/SocketMessage';
import {AudioFileUrls} from '../../components/sound/Audio';
import {Palantoaster} from '../../components/toaster/Toaster';
import history from '../../history';
import {StaticRoutes} from '../../routes';
import {getGamePlayer} from '../gamePlayer/GamePlayerSelectors';
import {SocketActions} from '../socket/socketService';
import {RoomActions} from './RoomActions';
import {RoomSelectors} from './RoomSelectors';
import {RoomStatusPayload} from './RoomTypes';

function* handleMessage(action: TypedAction<SocketMessage>) {
  const message = action.payload;
  switch (message.type) {
    case RoomSocketMessages.enterRoom.type:
      yield call(handleEnterRoomMessage, message.payload);
      break;
    case RoomSocketMessages.playerStatusUpdated.type:
      yield call(handlePlayerStatusUpdated, message.payload);
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
    case RoomSocketMessages.notifyPlayer.type:
      yield call(handleNotifyPlayer, message.payload);
      break;
  }
}

export function* handleEnterRoomMessage(payload: EnterRoomMessagePayload) {
  yield put(
    RoomActions.setPlayerStatus({
      playerId: payload.playerId,
      playerStatus: PlayerStatus.Online,
    })
  );
}

export function* handlePlayerStatusUpdated(
  payload: PlayerStatusUpdatedMessagePayload
) {
  yield put(
    RoomActions.setPlayerStatus({
      playerId: payload.playerId,
      playerStatus: payload.playerStatus,
    })
  );
}

export function* handleRoomStatusMessage(payload: RoomStatusPayload) {
  const gamePlayer: ReturnType<typeof getGamePlayer> = yield select(
    getGamePlayer
  );
  if (gamePlayer != null) {
    yield put(
      RoomActions.roomStatus({
        playerId: gamePlayer.playerId,
        room: payload.room,
      })
    );
  }
}

export function* handleRoomChatMessage(payload: RoomChatMessagePayload) {
  yield put(RoomActions.chatReceived(payload.chat));
}

export function* handleGameUpdatesMessage(payload: GameUpdatesMessagePayload) {
  yield put(
    RoomActions.gameUpdate({gameId: payload.gameId, events: payload.events})
  );
  yield call(autoSaga);
}

export function* handleNewGameMessage(payload: NewGameMessagePayload) {
  yield put(
    RoomActions.newGameCreated({
      gameSettings: payload.settings,
      gameId: payload.gameId,
    })
  );
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

let lastNotificationTime: number | null = null;

export function* handleNotifyPlayer(payload: NotifyPlayerMessagePayload) {
  const room: ReturnType<typeof RoomSelectors.getRoom> = yield select(
    RoomSelectors.getRoom
  );
  if (room?.playerId !== payload.playerId) {
    return;
  }
  const now = Date.now();
  if (lastNotificationTime == null || now - lastNotificationTime > 10_000) {
    const audio = new Audio(AudioFileUrls.Pylons);
    audio.play();
    lastNotificationTime = now;
  }
}

export function* roomSaga() {
  yield all([
    takeEvery(SocketActions.message.TYPE, handleMessage),
    takeEvery(RoomActions.setAutoplay.TYPE, autoSaga),
    takeEvery(RoomActions.setAutopass.TYPE, autoSaga),
  ]);
}

function* autoSaga() {
  const room: ReturnType<typeof RoomSelectors.getRoom> = yield select(
    RoomSelectors.getRoom
  );
  const roomId = room?.id;
  const game = room?.game;
  const gamePlayer = room?.playerId;
  const playState = game?.playState;
  const nextPlayerToPlay = game?.playState.toPlay;

  const autoplay: ReturnType<typeof RoomSelectors.getAutoplay> = yield select(
    RoomSelectors.getAutoplay
  );
  if (
    roomId &&
    game &&
    gamePlayer === nextPlayerToPlay &&
    gamePlayer != null &&
    autoplay
  ) {
    yield delay(1000);
    yield put(SocketActions.send(RoomSocketMessages.autoplay({roomId})));
  }

  const nextPlayerToBid = playState?.toBid
    ? playState.playerOrder[playState?.toBid]
    : undefined;
  const autopass: ReturnType<typeof RoomSelectors.getAutoplay> = yield select(
    RoomSelectors.getAutopass
  );
  if (
    roomId &&
    game &&
    gamePlayer === nextPlayerToBid &&
    gamePlayer != null &&
    autopass
  ) {
    yield delay(1000);
    const action: BidAction = {
      type: 'bid',
      bid: 0,
      player: gamePlayer,
      time: Date.now(),
    };
    yield put(
      SocketActions.send(
        RoomSocketMessages.gameAction({roomId, playerId: gamePlayer, action})
      )
    );
  }
}

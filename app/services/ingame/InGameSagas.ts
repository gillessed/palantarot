import { END, eventChannel, SagaIterator } from 'redux-saga';
import { call, cancelled, put, take } from 'redux-saga/effects';
import { DebugPlayAction, DebugPlayMessage, PlayAction, PlayError, PlayMessage, PlayUpdates } from '../../../server/play/PlayMessages';
import { PlayerEvent } from '../../play/common';
import { takeEveryPayload, takeLatestTyped } from '../redux/serviceSaga';
import { DebugInGameActions, InGameActions } from './InGameActions';
import { JoinGamePayload } from './InGameTypes';

export const AutoplayActionType = 'debug_autoplay';

function* joinGameSaga(payload: JoinGamePayload): SagaIterator {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const websocketUri = `${protocol}//${window.location.host}/ws`;
  const websocket = new WebSocket(websocketUri);
  const message: PlayMessage = {
    type: 'play',
    game: payload.game,
    player: payload.player,
  }
  websocket.onopen = () => {
    websocket.send(JSON.stringify(message));
  };

  const channel = yield call(listen, websocket);
  yield takeEveryPayload(InGameActions.playAction, function* (action) {
    const message: PlayAction = {
      type: 'play_action',
      action: action,
    }
    websocket.send(JSON.stringify(message));
  });
  yield takeEveryPayload(InGameActions.exitGame, function* () {
    channel.close();
  });
  yield takeEveryPayload(DebugInGameActions.debugJoinGame, function* (action) {
    const debugMessage: DebugPlayMessage = {
      type: 'debug_play',
      player: action.player,
    }
    websocket.send(JSON.stringify(debugMessage));
  });
  yield takeEveryPayload(DebugInGameActions.debugPlayAction, function* (action) {
    const debugMessage: DebugPlayAction = {
      type: 'debug_play_action',
      action: action,
    }
    websocket.send(JSON.stringify(debugMessage));
  });
  yield takeLatestTyped(DebugInGameActions.autoplay, function* () {
    const autoplayMessage = {
      type: AutoplayActionType,
    }
    websocket.send(JSON.stringify(autoplayMessage));
  });
  try {
    while (true) {
      const events: PlayerEvent[] = yield take(channel);
      yield put(InGameActions.playUpdate(events))
    }
  } finally {
    if (yield cancelled()) {
      channel.close();
    }
  }
}

export function* inGameSaga() {
  yield takeEveryPayload(InGameActions.joinGame, joinGameSaga);
}

type Message = PlayUpdates | PlayError;

function listen(socket: WebSocket) {
  return eventChannel((emitter) => {

    socket.onmessage = (event) => {
      const data: Message = JSON.parse(event.data);
      console.debug("Got data", data);
      if (data.type === 'play_updates') {
        emitter(data.events)
      } else if (data.type === 'play_error') {
        emitter([{ type: 'error', error: data.error }])
      }
    };

    socket.onclose = () => emitter(END);
    return () => {
      socket.close();
    }
  });
}

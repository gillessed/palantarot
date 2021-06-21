import { TypedAction } from 'redoodle';
import { END, EventChannel, eventChannel } from 'redux-saga';
import { cancelled, put, take, takeEvery } from 'redux-saga/effects';
import { generateId } from '../../../server/utils/randomString';
import { socketConnectionMessage, SocketMessage } from '../../../server/websocket/SocketMessage';
import { actionName } from '../redux/actionName';

export interface SocketConnectPayload {
  id: string;
  initialMessages: SocketMessage[];
}

const name = actionName('socketService');

export const SocketActions = {
  connect: TypedAction.define(name('connect'))<SocketConnectPayload>(),
  message: TypedAction.define(name('message'))<SocketMessage<any>>(),
  send: TypedAction.define(name('send'))<SocketMessage<any>>(),
  error: TypedAction.define(name('error'))<Error>(),
  close: TypedAction.define(name('close'))<void>(),
}

export function* socketSaga() {
  yield takeEvery(SocketActions.connect.TYPE, connectSaga);
}

const socketQueue: SocketMessage<any>[] = [];

function* connectSaga(action: TypedAction<SocketConnectPayload>) {
  const socketId = generateId();
  const websocket = openSocket();
  websocket.onopen = () => {
    websocket.send(JSON.stringify(socketConnectionMessage(socketId)));
    for (const message of action.payload.initialMessages) {
      websocket.send(JSON.stringify(message));
    }
    for (const message of socketQueue) {
      websocket.send(JSON.stringify(message));
    }
    while (socketQueue.length > 0) {
      socketQueue.pop();
    }
  };
  const channel: EventChannel<SocketMessage<any>> = listen(websocket);
  yield takeEvery(SocketActions.send.TYPE, sendSaga, websocket);
  yield takeEvery(SocketActions.close.TYPE, closeSaga, channel);

  try {
    while (true) {
      const socketMessage: SocketMessage<any> = yield take(channel);
      yield put(SocketActions.message(socketMessage));
    }
  } finally {
    if (yield cancelled()) {
      channel.close();
    }
  }
}

function* sendSaga(websocket: WebSocket, action: TypedAction<SocketMessage<any>>) {
  if (websocket.readyState === WebSocket.OPEN) {
    websocket.send(JSON.stringify(action.payload));
  } else if (websocket.readyState === WebSocket.CONNECTING) {
    socketQueue.unshift(action.payload);
  }
}

function* closeSaga(channel: EventChannel<SocketMessage<any>>) {
  channel.close();
}

function listen(socket: WebSocket): EventChannel<SocketMessage<any>> {
  return eventChannel((emitter) => {
    socket.onmessage = (event) => {
      try {
        const data: SocketMessage<any> = JSON.parse(event.data);
        emitter(data);
      } catch (error) {
        // TODO: emit error
      }
    };

    socket.onclose = () => emitter(END);
    return () => {
      socket.close();
    }
  });
}

function openSocket() {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const websocketUri = `${protocol}//${window.location.host}/ws`;
  return new WebSocket(websocketUri);
}

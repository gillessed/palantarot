import { TypedAction } from 'redoodle';
import { END, EventChannel, eventChannel } from 'redux-saga';
import { cancelled, put, take, takeEvery } from 'redux-saga/effects';
import { SocketMessage } from '../../../server/websocket/SocketMessage';

export type MessagePayload<JoinPayload> = {
  metadata: JoinPayload;
  message: SocketMessage;
}

export interface SocketActions<JoinPayload> {
  join: TypedAction.Definition<string, JoinPayload>,
  message: TypedAction.Definition<string, MessagePayload<JoinPayload>>,
  send: TypedAction.Definition<string, SocketMessage>,
  error: TypedAction.Definition<string, Error>,
  close: TypedAction.Definition<string, void>,
}

export function createSocketService<JoinPayload, MessageType = SocketMessage>(
  prefix: string,
  getInitialMessage: (payload: JoinPayload) => MessageType,
) {
  const socketActions = createSocketActions<JoinPayload>(prefix);
  const saga = createSocketSaga<JoinPayload, MessageType>(socketActions, getInitialMessage);
  return {
    actions: socketActions,
    saga,
  };
}

function createSocketActions<JoinPayload>(prefix: string): SocketActions<JoinPayload> {
  return {
    join: TypedAction.define(`${prefix} SOCKET // JOIN`)<JoinPayload>(),
    message: TypedAction.define(`${prefix} SOCKET // MESSAGE`)<MessagePayload<JoinPayload>>(),
    send: TypedAction.define(`${prefix} SOCKET // SEND`)<SocketMessage>(),
    error: TypedAction.define(`${prefix} SOCKET // ERROR`)<Error>(),
    close: TypedAction.define(`${prefix} SOCKET // CLOSE`)<void>(),
  }
}

function createSocketSaga<JoinPayload, MessageType = SocketMessage>(
  socketActions: SocketActions<JoinPayload>,
  getInitialMessage: (payload: JoinPayload) => MessageType,
) {
  const socketQueue: SocketMessage[] = [];
  function* joinSaga(action: TypedAction<JoinPayload>) {
    const websocket = openSocket();
    const initialMessage = getInitialMessage(action.payload);
    websocket.onopen = () => {
      console.log('socket opened, sending messages', initialMessage, socketQueue);
      websocket.send(JSON.stringify(initialMessage));
      for (const message of socketQueue) {
        websocket.send(JSON.stringify(message));
      }
      while (socketQueue.length > 0) {
        socketQueue.pop();
      }
    };
    const channel: EventChannel<SocketMessage> = listen(websocket);
    yield takeEvery(socketActions.send.TYPE, sendSaga, websocket);
    yield takeEvery(socketActions.close.TYPE, closeSaga, channel);

    try {
      while (true) {
        const socketMessage: SocketMessage = yield take(channel);
        const payload = {
          metadata: action.payload,
          message: socketMessage,
        };
        yield put(socketActions.message(payload));
      }
    } finally {
      if (yield cancelled()) {
        channel.close();
      }
    }
  }

  function* sendSaga(websocket: WebSocket, action: TypedAction<SocketMessage>) {
    if (websocket.readyState === WebSocket.OPEN) {
      console.log('sending websocket message', action.payload);
      websocket.send(JSON.stringify(action.payload));
    } else if (websocket.readyState === WebSocket.CONNECTING) {
      console.log('queueing websocket message', action.payload);
      socketQueue.unshift(action.payload);
    }
  }

  function* closeSaga(channel: EventChannel<SocketMessage>) {
    channel.close();
  }

  return function* () {
    yield takeEvery(socketActions.join.TYPE, joinSaga);
  }
}

function listen(socket: WebSocket): EventChannel<SocketMessage> {
  return eventChannel((emitter) => {
    socket.onmessage = (event) => {
      try {
        const data: SocketMessage = JSON.parse(event.data);
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

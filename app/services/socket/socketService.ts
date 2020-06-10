import { TypedAction } from 'redoodle';
import { Channel, END, eventChannel } from 'redux-saga';
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
  function* joinSaga(action: TypedAction<JoinPayload>) {
    const websocket = openSocket();
    const initialMessage = getInitialMessage(action.payload);
    websocket.onopen = () => {
      websocket.send(JSON.stringify(initialMessage));
    };
    const channel: Channel<SocketMessage> = listen(websocket);
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
    websocket.send(JSON.stringify(action.payload));
  }

  function* closeSaga(channel: Channel<SocketMessage>) {
    channel.close();
  }

  return function* () {
    yield takeEvery(socketActions.join.TYPE, joinSaga);
  }
}

function listen(socket: WebSocket): Channel<SocketMessage> {
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

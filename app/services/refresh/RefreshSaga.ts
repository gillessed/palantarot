import { eventChannel, END } from 'redux-saga';
import { WebsocketMessage, MessageType } from '../../../server/websocket/WebsocketManager';
import { call, take, put } from 'redux-saga/effects';
import { RefreshActions } from './RefreshTypes';

export function* refreshSaga() {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const websocketUri = `${protocol}//${window.location.host}/ws`;
  console.log('Connecting websocket to ' + websocketUri);
  const websocket = new WebSocket(websocketUri);
  const channel = yield call(listen, websocket);
  try {
    while (true) {
      const message: WebsocketMessage = yield take(channel);
      yield call(handleMessage, message);
    }
  } finally { }
}

function listen(websocket: WebSocket) {
  return eventChannel((emitter) => {
    websocket.onmessage = (messageEvent: MessageEvent) => {
      const data: WebsocketMessage = JSON.parse(messageEvent.data);
      emitter(data);
    }
    websocket.onclose = () => emitter(END);
    return () => {
      websocket.close();
    }
  });
}

function* handleMessage(message: WebsocketMessage) {
  switch (message.type) {
    case MessageType.REFRESH:
      yield put(RefreshActions.increment());
      break;
    default:
      console.warn('Unknown websocket message type: ', message);
  }
}

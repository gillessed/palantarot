import {actionName} from '../../app/services/redux/actionName';

export interface SocketMessage<Payload = any> {
  type: string;
  payload: Payload;
}

export interface SocketMessageDefinition<Payload> {
  (payload: Payload): SocketMessage<Payload>;
  type: string;
  handle: (
    message: SocketMessage<any>,
    handler: (payload: Payload) => void
  ) => void;
  handleMessage: (
    message: SocketMessage<any>,
    handler: (message: SocketMessage<Payload>) => void
  ) => void;
}

export const defineSocketMessage = <Payload>(
  type: string
): SocketMessageDefinition<Payload> => {
  const definition: SocketMessageDefinition<Payload> = (payload: Payload) => ({
    type,
    payload,
  });
  definition.type = type;
  definition.handle = (
    message: SocketMessage<any>,
    handler: (payload: Payload) => void
  ) => {
    if (message.type === type) {
      handler(message.payload);
    }
  };
  definition.handleMessage = (
    message: SocketMessage<any>,
    handler: (message: SocketMessage<Payload>) => void
  ) => {
    if (message.type === type) {
      handler(message);
    }
  };
  return definition;
};

const connectionMessageName = actionName('websocket')(
  'socketConnectionMessage'
);
export const socketConnectionMessage = defineSocketMessage<string>(
  connectionMessageName
);

export const isSocketConnectionMessage = (
  data: any
): data is SocketMessage<string> => {
  if (data == null) {
    return false;
  }
  const {type, payload} = data;
  return (
    type === connectionMessageName &&
    payload != null &&
    typeof payload === 'string' &&
    payload.length > 0
  );
};

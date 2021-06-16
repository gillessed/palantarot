import { SocketMessage } from "./SocketMessage";

export const SocketConnectionMessageType = 'connect';
export interface SocketConnectionMessage extends SocketMessage {
  type: typeof SocketConnectionMessageType;
  socketId: string;
}

export const buildSocketConnectionMessage = (socketId: string): SocketConnectionMessage => ({
  type: SocketConnectionMessageType,
  socketId,
});

export const isSocketConnectionMessage = (data: any): data is SocketConnectionMessage => {
  if (data == null) {
    return false;
  }
  const { type, socketId } = data;
  return (
    type === SocketConnectionMessageType
    && socketId != null
    && typeof socketId === 'string'
    && socketId.length > 0
  );
}

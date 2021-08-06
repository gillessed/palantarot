import { JsonSocket } from './JsonSocket';
import { SocketMessage } from './SocketMessage';

export interface SocketMessageListener {
  handleMessage: (
    socketId: string,
    socket: JsonSocket,
    message: SocketMessage
  ) => void;
}

export interface SocketCloseListener {
  handleClose: (socketId: string) => void;
}

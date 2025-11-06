import { JsonSocket } from "./JsonSocket";
import { type SocketMessage } from "./SocketMessage";

export interface SocketMessageListener {
  handleMessage: (socketId: string, socket: JsonSocket, message: SocketMessage) => void;
}

export interface SocketCloseListener {
  handleClose: (socketId: string) => void;
}

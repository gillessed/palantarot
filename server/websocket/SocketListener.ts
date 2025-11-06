import { JsonSocket } from "./JsonSocket.ts";
import { type SocketMessage } from "./SocketMessage.ts";

export interface SocketMessageListener {
  handleMessage: (socketId: string, socket: JsonSocket, message: SocketMessage) => void;
}

export interface SocketCloseListener {
  handleClose: (socketId: string) => void;
}

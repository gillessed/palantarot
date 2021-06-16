import { JsonSocket } from "./JsonSocket";
import { SocketMessage } from "./SocketMessage";

export interface SocketListener<S extends SocketMessage> {
  messageType: string;
  handleMessage?: (socketId: string, socket: JsonSocket, message: S) => void;
  handleClose?: (socketId: string) => void;
}

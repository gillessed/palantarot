import { v4 as uuid } from "uuid";
import {
  socketConnectionMessage,
  SocketMessage,
} from "../../../server/websocket/SocketMessage";

function openSocket() {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const websocketUri = `${protocol}//${window.location.host}/ws`;
  return new WebSocket(websocketUri);
}

export class ClientSocket {
  public socketQueue: SocketMessage<any>[] = [];
  private socket: WebSocket | undefined;
  private listeners = new Set<(message: SocketMessage<any>) => void>();
  private errorListeners = new Set<(error: any) => void>();

  public connect = () => {
    const socketId = uuid();
    this.socket = openSocket();
    this.socket.onopen = () => {
      this.send(socketConnectionMessage(socketId));
      for (const message of this.socketQueue) {
        this.send(message);
      }
      this.socketQueue.splice(0);
    };
    this.listen();
  };

  public send = (message: SocketMessage<any>) => {
    if (this.socket == null) {
      return;
    }
    if (this.socket.readyState === WebSocket.OPEN) {
      this.socket?.send(JSON.stringify(message));
    } else {
      this.socketQueue.push(message);
    }
  };

  private listen = () => {
    if (this.socket == null) {
      return;
    }
    this.socket.onmessage = (event) => {
      try {
        const data: SocketMessage<any> = JSON.parse(event.data);
        // TODO: verify at least type
        for (const listener of this.listeners) {
          listener?.(data);
        }
      } catch (error: any) {
        for (const listener of this.errorListeners) {
          listener?.(error);
        }
      }
    };
    this.socket.onerror = (event) => {
      for (const listener of this.errorListeners) {
        listener?.(new Error("Socket error: " + event.type));
      }
    };
    this.socket.onclose = () => {
      this.socket = undefined;
    };
    return () => {
      this.close();
    };
  };

  public addListener = (
    listener: (message: SocketMessage<any>) => void
  ): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  public addErrorListener = (listener: (error: any) => void): (() => void) => {
    this.errorListeners.add(listener);
    return () => {
      this.errorListeners.delete(listener);
    };
  };

  public close = () => {
    this.socket?.close();
  };
}

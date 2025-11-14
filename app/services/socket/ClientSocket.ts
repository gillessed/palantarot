import { v4 as uuid } from "uuid";
import { socketConnectionMessage, SocketMessage } from "../../../server/websocket/SocketMessage";

function openSocket() {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const websocketUri = `${protocol}//${window.location.host}/ws`;
  console.log("opening websocket to ", websocketUri);
  return new WebSocket(websocketUri);
}

export class ClientSocket {
  public socketQueue: SocketMessage<any>[] = [];
  private socket: WebSocket | undefined;

  public connect = (
    handleMessage: (message: SocketMessage<any>) => void,
    handleError?: (error: Error) => void
  ) => {
    const socketId = uuid();
    this.socket = openSocket();
    console.log("connecting")
    this.socket.onopen = () => {
      console.log("connected socket to server")
      this.send(socketConnectionMessage(socketId));
      for (const message of this.socketQueue) {
        this.send(message);
      }
      while (this.socketQueue.length > 0) {
        this.socketQueue.pop();
      }
    };
    this.listen(handleMessage, handleError);
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

  private listen = (
    handleMessage: (message: SocketMessage<any>) => void,
    handleError?: (error: Error) => void
  ) => {
    if (this.socket == null) {
      return;
    }
    this.socket.onmessage = (event) => {
      try {
        const data: SocketMessage<any> = JSON.parse(event.data);
        // TODO: verify at least type
        handleMessage(data);
      } catch (error: any) {
        handleError?.(error);
      }
    };
    this.socket.onclose = () => {
      this.socket = undefined;
    };
    return () => {
      this.close();
    };
  };

  public close = () => {
    this.socket?.close();
  };
}

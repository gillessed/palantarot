import WebSocket from "ws";
import { type SocketMessage } from "./SocketMessage.ts";

export class JsonSocket {
  public handleClose?: () => void;
  public handleMessage?: (message: SocketMessage<any>) => void;
  public handleError?: (error: Error) => void;

  private readonly webSocket: WebSocket;
  constructor(webSocket: WebSocket) {
    this.webSocket = webSocket;
    webSocket.onmessage = this.handleWebSocketMessage;
    webSocket.onclose = this.handleWebSocketClose;
  }

  public send(message: SocketMessage<any>) {
    try {
      this.webSocket.send(JSON.stringify(message));
    } catch (error: any) {
      if (this.handleError) {
        this.handleError(error);
      }
    }
  }

  public close() {
    this.webSocket.close();
  }

  private handleWebSocketMessage = (event: WebSocket.MessageEvent) => {
    try {
      const data: SocketMessage<any> = JSON.parse(event.data as string);
      if (this.handleMessage) {
        this.handleMessage(data);
      }
    } catch (error: any) {
      if (this.handleError) {
        this.handleError(error);
      }
    }
  };

  private handleWebSocketClose = () => {
    if (this.handleClose) {
      this.handleClose();
    }
  };
}

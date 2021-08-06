import http from 'http';
import https from 'https';
import WebSocket, {MessageEvent} from 'ws';
import {JsonSocket} from './JsonSocket';
import {SocketCloseListener, SocketMessageListener} from './SocketListener';
import {isSocketConnectionMessage, SocketMessage} from './SocketMessage';

export class WebsocketManager {
  private server?: WebSocket.Server;
  private socketMap: Map<string, JsonSocket>;
  private socketMessageListeners: Set<SocketMessageListener>;
  private socketCloseListeners: Set<SocketCloseListener>;

  constructor() {
    this.socketMap = new Map();
    this.socketMessageListeners = new Set();
    this.socketCloseListeners = new Set();
  }

  public start(server: http.Server | https.Server) {
    this.server = new WebSocket.Server({server});
    this.server.on('connection', socket => {
      socket.onmessage = (event: MessageEvent) => {
        try {
          const data: SocketMessage<any> = JSON.parse(event.data as string);
          if (isSocketConnectionMessage(data)) {
            const socketId = data.payload;
            console.debug(`socket ${socketId} connected`);
            this.addNewSocket(socket, socketId);
          } else {
            socket.close();
          }
        } catch (error) {
          socket.close();
        }
      };
    });
  }

  private addNewSocket = (socket: WebSocket, socketId: string) => {
    if (this.socketMap.has(socketId)) {
      socket.close();
      return;
    }
    const jsonSocket = new JsonSocket(socket);
    jsonSocket.handleMessage = (message: SocketMessage<any>) => {
      // console.debug('received message', JSON.stringify(message, null, 2));
      for (const listener of this.socketMessageListeners) {
        listener.handleMessage(socketId, jsonSocket, message);
      }
    };
    jsonSocket.handleClose = () => {
      console.debug(`socket ${socketId} disconnected`);
      for (const listener of this.socketCloseListeners) {
        listener.handleClose(socketId);
      }
      this.socketMap.delete(socketId);
    };
    this.socketMap.set(socketId, jsonSocket);
  };

  public getSocket(userId: string) {
    return this.socketMap.get(userId);
  }

  public addMessageListener(listener: SocketMessageListener) {
    this.socketMessageListeners.add(listener);
  }

  public addCloseListener(listener: SocketCloseListener) {
    this.socketCloseListeners.add(listener);
  }
}

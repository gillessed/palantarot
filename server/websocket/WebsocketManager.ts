import http from 'http';
import https from 'https';
import WebSocket, { MessageEvent } from 'ws';
import { JsonSocket } from './JsonSocket';
import { isSocketConnectionMessage, SocketConnectionMessage } from './SocketConnectionMessage';
import { SocketListener } from './SocketListener';
import { SocketMessage } from './SocketMessage';

export class WebsocketManager {
  private server: WebSocket.Server;
  private socketMap: Map<string, JsonSocket>;
  private socketListeners: Set<SocketListener<any>>;

  constructor() {
    this.socketMap = new Map();
    this.socketListeners = new Set();
  }

  public start(server: http.Server | https.Server) {
    this.server = new WebSocket.Server({ server });
    this.server.on('connection', (socket) => {
      socket.onmessage = (event: MessageEvent) => {
        try {
          const data: SocketMessage = JSON.parse(event.data as string);
          if (isSocketConnectionMessage(data)) {
            console.log(`socket ${data.socketId} connected`);
            this.addNewSocket(socket, data);
          } else {
            socket.close();
          }
        } catch (error) {
          socket.close();
        }
      };
    });
  }

  private addNewSocket = (socket: WebSocket, { socketId }: SocketConnectionMessage) => {
    if (this.socketMap.has(socketId)) {
      socket.close();
      return;
    }
    const jsonSocket = new JsonSocket(socket);
    jsonSocket.handleMessage = (message: SocketMessage) => {
      console.log('received socket message ', message);
      for (const listener of this.socketListeners) {
        if (listener.messageType === message.type && listener.handleMessage) {
          listener.handleMessage(socketId, jsonSocket, message);
        }
      }
    }
    jsonSocket.handleClose = () => {
      console.log(`socket ${socketId} disconnected`);
      for (const listener of this.socketListeners) {
        if (listener.handleClose) {
          listener?.handleClose(socketId);
        }
      }
      this.socketMap.delete(socketId);
    }
    this.socketMap.set(socketId, jsonSocket);
  }

  public getSocket(userId: string) {
    return this.socketMap.get(userId);
  }

  public addListener(socketListener: SocketListener<any>) {
    this.socketListeners.add(socketListener);
  }

  public removeListener(socketListener: SocketListener<any>) {
    this.socketListeners.delete(socketListener);
  }
}

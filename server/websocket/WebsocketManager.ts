import http from 'http';
import https from 'https';
import WebSocket, { MessageEvent } from 'ws';
import { PlayMessage, PlayService } from "../play/PlayService";

export enum MessageType {
  REFRESH = 'REFRESH',
}

export interface WebsocketMessage {
  type: MessageType;
  data?: Object;
}

export class WebsocketManager {
  private server: WebSocket.Server;
  private clients: Set<WebSocket>;
  private playService: PlayService;

  public start(server: http.Server | https.Server) {
    this.clients = new Set();
    this.server = new WebSocket.Server({ server });
    this.server.on('connection', (socket) => {
      console.log('Websocket connected');
      this.clients.add(socket);

      socket.on('close', () => {
        console.log('Websocket disconnected');
        this.clients.delete(socket);
      });

      socket.onmessage = (event: MessageEvent) => {
        const data = JSON.parse(event.data as string);
        if (data.type === 'play') {
          if (!this.playService) {
            socket.emit("error",
              "Cannot subscribe to game, as service has not been initialized.");
            return;
          }
          const message: PlayMessage = data;
          this.playService.addSocket(message.game, message.player, socket);
        }
      };
    });
  }

  public initPlayService(service: PlayService) {
    this.playService = service;
  }

  private send(message: WebsocketMessage) {
    for (const client of this.clients) {
      client.send(JSON.stringify(message));
    }
  }

  public sendNewDataMessage() {
    this.send({
      type: MessageType.REFRESH
    });
  }
}

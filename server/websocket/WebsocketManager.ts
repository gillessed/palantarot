import WebSocket, {MessageEvent} from 'ws';
import https from 'https';
import http from 'http';
import {PlayMessage, PlayService} from "../play/PlayService";

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
  private play_service: PlayService;

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
          if (!this.play_service) {
            socket.emit("error",
              "Cannot subscribe to game, as service has not been initialized.");
            return;
          }
          const message: PlayMessage = data;
          this.play_service.addSocket(message.game, message.player, socket);
        }
      };
    });
  }

  public initPlayService(service: PlayService) {
    this.play_service = service;
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

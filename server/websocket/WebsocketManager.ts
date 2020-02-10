import { Config } from '../config';
import WebSocket from 'ws';
import https from 'https';
import http from 'http';

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
    });
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

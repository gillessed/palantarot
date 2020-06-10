import http from 'http';
import https from 'https';
import WebSocket, { MessageEvent } from 'ws';
import { JsonSocket } from './JsonSocket';
import { SocketChannelManager } from './SocketChannelManager';
import { SocketMessage } from './SocketMessage';

export class WebsocketManager {
  private server: WebSocket.Server;
  private channels: Map<string, SocketChannelManager<any>>;

  constructor() {
    this.channels = new Map<string, SocketChannelManager<any>>();
  }

  public start(server: http.Server | https.Server) {
    this.server = new WebSocket.Server({ server });
    this.server.on('connection', (socket) => {
      socket.onmessage = (event: MessageEvent) => {
        const data: SocketMessage = JSON.parse(event.data as string);
        const channel = data.type;
        const manager = this.channels.get(channel);
        if (manager) {
          console.debug(`${channel} socket connected`);
          socket.onmessage = () => {};
          manager.addSocket(new JsonSocket(socket), data);
        }
      };
    });
  }

  public addChannel(channelManager: SocketChannelManager<any>) {
    this.channels.set(channelManager.channel, channelManager);
  }
}

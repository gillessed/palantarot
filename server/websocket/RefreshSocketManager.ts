import { JsonSocket } from './JsonSocket';
import { SocketChannelManager } from './SocketChannelManager';
import { SocketMessage } from './SocketMessage';
import { WebsocketManager } from './WebsocketManager';

export interface RefreshMessage extends SocketMessage {
  type: 'Refresh',
}

export class RefreshSocketManager extends SocketChannelManager<RefreshMessage> {
  static Type: 'Refresh' = 'Refresh';

  private sockets: Set<JsonSocket>;

  constructor(websocketManager: WebsocketManager) {
    super(websocketManager, RefreshSocketManager.Type);
    this.sockets = new Set();
  }

  public addSocket(socket: JsonSocket, data: RefreshMessage) {
    this.sockets.add(socket);
    socket.handleClose = () => this.sockets.delete(socket);
  }

  public sendRefreshMessage() {
    const message: RefreshMessage = { type: RefreshSocketManager.Type }
    for (const socket of this.sockets) {
      socket.send(message);
    }
  }
}
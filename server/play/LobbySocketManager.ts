import { JsonSocket } from '../websocket/JsonSocket';
import { SocketChannelManager } from '../websocket/SocketChannelManager';
import { WebsocketManager } from '../websocket/WebsocketManager';
import { getGameDescription } from './GameDescription';
import { EnterLobbyMessage, LobbyUpdateMessage } from './LobbyMessages';
import { PlayService } from './PlayService';


export class LobbySocketManager extends SocketChannelManager<EnterLobbyMessage> {
  static Type = 'lobby';

  private sockets: Set<JsonSocket>;

  constructor(
    websocketManager: WebsocketManager,
    private playService: PlayService,
  ) {
    super(websocketManager, LobbySocketManager.Type);
    this.sockets = new Set();
  }

  public addSocket(webSocket: JsonSocket, data: EnterLobbyMessage) {
    webSocket.handleClose = () => this.sockets.delete(webSocket);
    this.sockets.add(webSocket);
  }

  public sendUpdateMessage(gameId: string) {
    const game = this.playService.games.get(gameId);
    if (!game) {
      return;
    }
    const message: LobbyUpdateMessage = {
      type: 'lobby_update',
      game: getGameDescription(game),
    };
    for (const socket of this.sockets) {
      socket.send(message);
    }    
  }
}
import { PlayService } from '../../api/PlayService';
import { JsonSocket } from '../../websocket/JsonSocket';
import { SocketListener } from '../../websocket/SocketListener';
import { EnteredLobbyMessage, EnteredLobbyMessageType, LobbySocketMessage, LobbySocketMessageType } from './LobbyMessages';

export class LobbySocketListener implements SocketListener<LobbySocketMessage> {
  public messageType: string = LobbySocketMessageType;

  constructor(
    private playService: PlayService,
  ) { }

  public handleMessage(socketId: string, socket: JsonSocket, message: LobbySocketMessage) {
    switch (message.messageType) {
      case EnteredLobbyMessageType:
        this.handleEnteredLobby(socketId, message as EnteredLobbyMessage);
        break;
    }
  }

  public handleClose(socketId: string) {
    const playerId = this.playService.getPlayerIdForSocket(socketId);
    this.playService.removeSocketById(socketId);
    if (playerId) {
      this.playService.lobbyPlayers.delete(playerId);
    }
  }

  public handleEnteredLobby(socketId: string, message: EnteredLobbyMessage) {
    const oldPlayer = this.playService.getPlayerIdForSocket(socketId);
    if (oldPlayer) {
      this.playService.lobbyPlayers.delete(oldPlayer);
      this.playService.removeSocketById(socketId);
    }
    this.playService.lobbyPlayers.add(message.playerId);
    this.playService.setPlayerSocketId(socketId, message.playerId);
  }
}

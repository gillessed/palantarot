import { PlayService } from '../../api/PlayService';
import { JsonSocket } from '../../websocket/JsonSocket';
import { SocketMessageListener } from '../../websocket/SocketListener';
import { SocketMessage } from '../../websocket/SocketMessage';
import { LobbySocketMessages } from './LobbySocketMessages';

export class LobbySocketListener implements SocketMessageListener {
  constructor(private playService: PlayService) {}

  public handleMessage(
    socketId: string,
    socket: JsonSocket,
    message: SocketMessage<any>
  ) {
    LobbySocketMessages.enterLobby.handle(message, payload => {
      this.playService.playerEnteredLobby(socketId);
    });
  }
}

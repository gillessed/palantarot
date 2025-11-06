import { PlayService } from "../../api/PlayService.ts";
import { JsonSocket } from "../../websocket/JsonSocket.ts";
import { type SocketMessageListener } from "../../websocket/SocketListener.ts";
import { type SocketMessage } from "../../websocket/SocketMessage.ts";
import { LobbySocketMessages } from "./LobbySocketMessages.ts";

export class LobbySocketListener implements SocketMessageListener {
  private readonly playService: PlayService;
  constructor(playService: PlayService) {
    this.playService = playService;
  }

  public handleMessage(socketId: string, socket: JsonSocket, message: SocketMessage<any>) {
    LobbySocketMessages.enterLobby.handle(message, (payload) => {
      this.playService.playerEnteredLobby(socketId);
    });
  }
}

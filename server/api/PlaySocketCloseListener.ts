import { type SocketCloseListener } from "../websocket/SocketListener.ts";
import { PlayService } from "./PlayService.ts";

export class PlaySocketCloseListener implements SocketCloseListener {
  private readonly playService: PlayService;
  constructor(playService: PlayService) {
    this.playService = playService;
  }

  public handleClose(socketId: string) {
    this.playService.socketClosed(socketId);
  }
}

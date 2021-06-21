import { SocketCloseListener } from '../websocket/SocketListener';
import { PlayService } from './PlayService';


export class PlaySocketCloseListener implements SocketCloseListener {
  constructor(
    private playService: PlayService,
  ) { }

  public handleClose(socketId: string) {
    this.playService.socketClosed(socketId);
  }
}

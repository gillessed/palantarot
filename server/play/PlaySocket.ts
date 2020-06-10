import { ErrorCode, PlayerEvent } from '../../app/play/common';
import { JsonSocket } from '../websocket/JsonSocket';
import { SocketMessage } from '../websocket/SocketMessage';
import { PlayError, PlayUpdates } from './PlayMessages';

export class PlaySocket {
  constructor(
    public readonly gameId: string,
    public readonly playerId: string,
    public readonly socket: JsonSocket,
  ) {}

  get id(): string {
    return PlaySocket.getId(this.gameId, this.playerId);
  }

  public close() {
    this.socket.close();
  }

  public send(object: SocketMessage) {
    this.socket.send(object);
  }

  public sendPlayerEvents(events: PlayerEvent[]) {
    const updates: PlayUpdates = {
      type: 'play_updates',
      events,
    };
    this.send(updates);
  }

  public sendError(message: string, errorCode?: ErrorCode) {
    const error: PlayError = {
      type: 'play_error',
      error: message,
      errorCode,
    };
    this.send(error);
  }

  public sendGameDoesNotExistError() {
    this.sendError(`Cannot subscribe to ${this.gameId} as it does not exist.`, ErrorCode.DOES_NOT_EXIST);
  }

  public sendAlreadyConnectedError() {
    this.sendError(`Cannot subscribe to ${this.gameId} as player ${this.playerId} is already in the game.`);
  }

  public static getId(gameId: string, playerId: string) {
    return `${gameId}-${playerId}`;
  }
}
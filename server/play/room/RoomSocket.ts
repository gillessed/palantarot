import { JsonSocket } from '../../websocket/JsonSocket';
import { RoomSocketMessage } from './RoomSocketMessages';

export class RoomSocket {
  constructor(
    public readonly roomId: string,
    public readonly playerId: string,
    public readonly socket: JsonSocket,
  ) {}

  get id(): string {
    return RoomSocket.getId(this.roomId, this.playerId);
  }

  public close() {
    this.socket.close();
  }

  public send(object: RoomSocketMessage) {
    this.socket.send(object);
  }

  public static getId(roomId: string, playerId: string) {
    return `${roomId}-${playerId}`;
  }
}

import { PlayService } from '../../api/PlayService';
import { JsonSocket } from '../../websocket/JsonSocket';
import { SocketListener } from '../../websocket/SocketListener';
import { ErrorCode } from '../model/GameEvents';
import { RoomSocketMessage, RoomSocketMessages, RoomSocketMessageType } from './RoomSocketMessages';

export class RoomSocketListener implements SocketListener<RoomSocketMessage> {
  public messageType: string = RoomSocketMessageType;

  constructor(
    private playService: PlayService,
  ) { }

  public handleMessage(socketId: string, socket: JsonSocket, message: RoomSocketMessage) {
    const { roomId } = message;
    const room = this.playService.rooms.get(roomId);
    if (room != null) {
      room.handleMessage(socketId, socket, message);
    } else {
      socket.send(RoomSocketMessages.error(message.roomId, "Room does not exist", ErrorCode.DOES_NOT_EXIST)); 
      console.log('Room not found for message ', roomId, message);
    }
  }

  public handleClose(socketId: string) {
    const playerId = this.playService.getPlayerIdForSocket(socketId);
    if (playerId) {
      for (const room of this.playService.rooms.values()) {
        room.handleClose(playerId);
      }
    }
  }
}

import { PlayService } from '../../api/PlayService';
import { JsonSocket } from '../../websocket/JsonSocket';
import { SocketMessageListener } from '../../websocket/SocketListener';
import { SocketMessage } from '../../websocket/SocketMessage';
import { ErrorCode } from '../model/GameEvents';
import { RoomSocketMessages } from './RoomSocketMessages';

export function isRoomMessage(message: SocketMessage): message is SocketMessage<{ roomId: string }> {
  return message.type.startsWith('room') && message.payload.roomId != null;
}

export class RoomSocketListener implements SocketMessageListener {
  constructor(
    private playService: PlayService,
  ) { }

  public handleMessage(socketId: string, socket: JsonSocket, message: SocketMessage) {
    if (!isRoomMessage(message)) {
      return;
    }
    const { roomId } = message.payload;
    const room = this.playService.getRoom(roomId);
    if (room != null) {
      room.handleMessage(socketId, socket, message);
    } else {
      socket.send(RoomSocketMessages.error({
        roomId,
        error: "Room does not exist",
        errorCode: ErrorCode.DOES_NOT_EXIST,
      }));
      console.error('Room not found for message ', roomId, message);
    }
  }
}

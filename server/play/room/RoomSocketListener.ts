import { PlayService } from "../../api/PlayService.ts";
import { JsonSocket } from "../../websocket/JsonSocket.ts";
import { type SocketMessageListener } from "../../websocket/SocketListener.ts";
import { type SocketMessage } from "../../websocket/SocketMessage.ts";
import { RoomSocketMessages } from "./RoomSocketMessages.ts";

export function isRoomMessage(message: SocketMessage): message is SocketMessage<{ roomId: string }> {
  return message.type.startsWith("room") && message.payload.roomId != null;
}

export class RoomSocketListener implements SocketMessageListener {
  private readonly playService: PlayService;
  constructor(playService: PlayService) {
    this.playService = playService;
  }

  public handleMessage(socketId: string, socket: JsonSocket, message: SocketMessage) {
    if (!isRoomMessage(message)) {
      return;
    }
    const { roomId } = message.payload;
    const room = this.playService.getRoom(roomId);
    if (room != null) {
      room.handleMessage(socketId, socket, message);
    } else {
      socket.send(
        RoomSocketMessages.error({
          roomId,
          error: "Room does not exist",
          errorCode: "DOES_NOT_EXIST",
        })
      );
      console.error("Room not found for message ", roomId, message);
    }
  }
}

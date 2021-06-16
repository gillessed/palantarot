import { SocketMessage } from '../../websocket/SocketMessage';
import { RoomDescription } from '../room/RoomDescription';

export interface EnterLobbyMessage extends SocketMessage {
  type: 'lobby',
}

export const LobbySocketMessageType = 'lobby';
export interface LobbySocketMessage extends SocketMessage {
  type: typeof LobbySocketMessageType;
  messageType: string;
}

export const EnteredLobbyMessageType = 'entered_lobby';
export interface EnteredLobbyMessage extends LobbySocketMessage {
  messageType: typeof EnteredLobbyMessageType,
  playerId: string;
}

export const RoomUpdatedMessageType = 'room_updated';
export interface RoomUpdatedMessage extends LobbySocketMessage {
  messageType: typeof RoomUpdatedMessageType,
  room: RoomDescription;
}

export const LobbyMessages = {
  enterLobby: (playerId: string): EnteredLobbyMessage => ({
    type: LobbySocketMessageType,
    messageType: EnteredLobbyMessageType,
    playerId,
  }),
  roomUpdated: (room: RoomDescription): RoomUpdatedMessage => ({
    type: LobbySocketMessageType,
    messageType: RoomUpdatedMessageType,
    room,
  }),
}

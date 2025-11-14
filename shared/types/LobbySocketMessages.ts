import { RoomDescription } from "../../server/play/room/RoomDescription";

export interface LobbyClientSocketMessage_Enter {
  type: "lobby_enter";
  playerId: string;
}

export const createLobbyClientSocketMessage_Enter = (
  playerId: string
): LobbyClientSocketMessage_Enter => ({ type: "lobby_enter", playerId });

export type LobbyClientSocketMessage = LobbyClientSocketMessage_Enter;

export interface LobbyServerSocketMessage_RoomUpdated {
  type: "lobby_room_updated";
  roomDescription: RoomDescription;
}

export const createLobbyServerSocketMessage_RoomUpdated = (
  roomDescription: RoomDescription
): LobbyServerSocketMessage_RoomUpdated => ({ type: "lobby_room_updated", roomDescription });

export type LobbyServerSocketMessage = LobbyServerSocketMessage_RoomUpdated;

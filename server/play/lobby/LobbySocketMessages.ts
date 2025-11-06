import { defineSocketMessage } from "../../websocket/SocketMessage.ts";
import { type RoomDescription } from "../room/RoomDescription.ts";

export interface EnterLobbyMessagePayload {
  playerId: string;
}

const name = (method: string) => `lobby::${method}`;

const enterLobby = defineSocketMessage<EnterLobbyMessagePayload>(name("enterLobby"));
const roomUpdated = defineSocketMessage<RoomDescription>(name("roomUpdated"));

export const LobbySocketMessages = {
  enterLobby,
  roomUpdated,
};

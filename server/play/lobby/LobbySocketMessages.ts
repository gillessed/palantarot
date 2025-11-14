import { defineSocketMessage } from "../../websocket/SocketMessage.ts";
import { type RoomDescription } from "../room/RoomDescription.ts";


const name = (method: string) => `lobby::${method}`;

const enterLobby = defineSocketMessage<void>(name("enterLobby"));
const roomUpdated = defineSocketMessage<RoomDescription>(name("roomUpdated"));

export const LobbySocketMessages = {
  enterLobby,
  roomUpdated,
};

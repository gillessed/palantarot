import { GameSettings } from "../model/GameSettings";
import { PlayerStatus } from "./PlayerStatus";
import { Room } from "./Room";

export type RoomDescriptions = { [key: string]: RoomDescription };

export interface RoomDescription {
  id: string;
  name: string;
  players: { [key: string]: PlayerStatus };
  settings: GameSettings;
}

export function getRoomDescription(room: Room): RoomDescription {
  const players: { [key: string]: PlayerStatus } = {};
  for (const playerId of room.players.keys()) {
    const status = room.players.get(playerId);
    if (status) {
      players[playerId] = status;
    }
  }
  return {
    id: room.id,
    name: room.name,
    players,
    settings: room.settings,
  };
}

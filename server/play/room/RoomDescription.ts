import { type Player } from "../../model/Player.ts";
import { type GameSettings } from "../model/GameSettings.ts";
import { type GameplayState } from "../model/GameState.ts";
import { type PlayerStatus } from "./PlayerStatus.ts";
import { Room } from "./Room.ts";

export type RoomDescriptions = Map<string, RoomDescription>;

export interface RoomDescription {
  id: string;
  name: string;
  players: { [key: string]: PlayerStatus };
  settings: GameSettings;
  gameState: GameplayState;
}

export function getRoomDescription(room: Room): RoomDescription {
  const players: { [key: string]: PlayerStatus } = {};
  for (const playerId of room.players.keys()) {
    const status = room.players.get(playerId);
    if (status != null) {
      players[playerId] = status;
    }
  }
  return {
    id: room.id,
    name: room.name,
    players,
    settings: room.settings,
    gameState: room.game.getState().name,
  };
}

export function getOnlinePlayersInRoom(
  room: RoomDescription,
  players: Map<string, Player>
): string[] {
  const playerIds: string[] = [];
  for (const playerId of Object.keys(room.players)) {
    const status = room.players[playerId];
    if (status === "Online" && !players.get(playerId)?.isBot) {
      playerIds.push(playerId);
    }
  }
  return playerIds;
}

import { Player } from '../../model/Player';
import { GameSettings } from '../model/GameSettings';
import { GameplayState } from '../model/GameState';
import { PlayerStatus } from './PlayerStatus';
import { Room } from './Room';

export type RoomDescriptions = {[key: string]: RoomDescription};

export interface RoomDescription {
  id: string;
  name: string;
  players: {[key: string]: PlayerStatus};
  settings: GameSettings;
  gameState: GameplayState;
}

export function getRoomDescription(room: Room): RoomDescription {
  const players: {[key: string]: PlayerStatus} = {};
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
    if (status === PlayerStatus.Online && !players.get(playerId)?.isBot) {
      playerIds.push(playerId);
    }
  }
  return playerIds;
}

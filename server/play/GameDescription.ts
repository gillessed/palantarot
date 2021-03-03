import { PlayerId } from '../../app/play/common';
import { Game, GameSettings } from '../../app/play/server';

export interface GameDescription {
  readonly id: string;
  readonly dateCreated: number;
  readonly state: string;
  readonly players: PlayerId[];
  readonly settings: GameSettings;
  readonly lastUpdated: number;
}

export function getGameDescription(game: Game): GameDescription {
  return {
    id: game.id,
    dateCreated: game.created.getTime(),
    state: game.getState().name,
    players: game.getState().players,
    lastUpdated: game.getLastAction(),
    settings: game.settings,
  }
}

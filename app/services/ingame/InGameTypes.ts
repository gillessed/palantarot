import { PlayerEvent, PlayerId } from '../../play/common';
import { PlayState } from '../../play/ingame/playLogic';

export interface InGameState {
  readonly player: PlayerId;
  readonly game_id: string;
  readonly events: PlayerEvent[];
  readonly state: PlayState;
}

export interface JoinGamePayload {
  player: PlayerId;
  game: string;
}

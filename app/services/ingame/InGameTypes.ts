import { PlayerEvent, PlayerId } from '../../play/common';
import { PlayState } from '../../play/ingame/playLogic';
import { GameSettings } from '../../play/server';

export interface InGameState {
  readonly player: PlayerId;
  readonly game_id: string;
  readonly events: PlayerEvent[];
  readonly state: PlayState;
  readonly autoplay: boolean;
  readonly settings: GameSettings | null;
}

export interface JoinGamePayload {
  player: PlayerId;
  game: string;
}

export interface MessageGroup {
  type: 'message_group';
  author: PlayerId;
  messages: string[];
  time: number;
}

export type SidebarEvent = PlayerEvent | MessageGroup;

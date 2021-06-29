import { PlayerEvent } from '../model/GameEvents';
import { GameSettings } from '../model/GameSettings';
import { ChatText } from './ChatText';
import { PlayerStatus } from './PlayerStatus';

export interface RoomStatus {
  id: string;
  color: string;
  name: string;
  players: { [key: string]: PlayerStatus };
  settings: GameSettings;
  gameId: string;
  gameEvents: PlayerEvent[];
  chat: ChatText[];
}

import {PlayerEvent} from '../../../server/play/model/GameEvents';
import {GameSettings} from '../../../server/play/model/GameSettings';
import {PlayState} from './ClientGameEventHandler';

export interface ClientGame {
  id: string;
  playerId: string;
  events: PlayerEvent[];
  playState: PlayState;
  settings: GameSettings | null;
}

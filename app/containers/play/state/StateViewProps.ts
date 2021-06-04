import { Player } from '../../../../server/model/Player';
import { Dispatchers } from '../../../services/dispatchers';
import { InGameState } from '../../../services/ingame/InGameTypes';
import { SpectatorMode } from '../SpectatorMode';

export interface StateViewProps {
  width: number;
  height: number;
  players: Map<string, Player>;
  game: InGameState;
  dispatchers: Dispatchers;
  spectatorMode: SpectatorMode;
  setSpectatorMode: (mode: SpectatorMode) => void;
}

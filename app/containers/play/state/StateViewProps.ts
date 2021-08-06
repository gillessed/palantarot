import { Player } from '../../../../server/model/Player';
import { Dispatchers } from '../../../services/dispatchers';
import { ClientGame } from '../../../services/room/ClientGame';
import { SpectatorMode } from '../SpectatorMode';

export interface StateViewProps {
  width: number;
  height: number;
  players: Map<string, Player>;
  game: ClientGame;
  dispatchers: Dispatchers;
  spectatorMode: SpectatorMode;
  setSpectatorMode: (mode: SpectatorMode) => void;
}

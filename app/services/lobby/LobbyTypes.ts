import { GameDescription } from '../../../server/play/GameDescription';
import { Loadable } from '../redux/loadable';

export type Lobby = Map<string, GameDescription>;
export type LobbyService = Loadable<void, Lobby>;

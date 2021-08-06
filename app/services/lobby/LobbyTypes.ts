import { RoomDescription } from '../../../server/play/room/RoomDescription';
import { Loadable } from '../redux/loadable';

export type Lobby = Map<string, RoomDescription>;
export type LobbyService = Loadable<void, Lobby>;

import { RoomDescription } from "../../../server/play/room/RoomDescription";
import type { Async } from "../../utils/Async";

export type Lobby = Map<string, RoomDescription>;
export type LobbyService = Async<Lobby>;

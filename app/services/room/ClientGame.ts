import { type PlayerEvent } from "../../../server/play/model/GameEvents";
import { type GameSettings } from "../../../server/play/model/GameSettings";
import { type PlayState } from "./ClientGameEventHandler";

export interface ClientGame {
  id: string;
  playerId: string;
  events: PlayerEvent[];
  playState: PlayState;
  settings: GameSettings | null;
}

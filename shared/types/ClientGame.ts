import { type PlayerEvent } from "../../server/play/model/GameEvents.ts";
import { type GameSettings } from "../../server/play/model/GameSettings.ts";
import { type PlayState } from "./ClientGameTypes.ts";

export interface ClientGame {
  id: string;
  playerId: string;
  events: PlayerEvent[];
  playState: PlayState;
  settings: GameSettings | null;
}

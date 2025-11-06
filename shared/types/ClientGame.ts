import { type PlayerEvent } from "../../server/play/model/GameEvents.ts";
import { type GameSettings } from "../../server/play/model/GameSettings";
import { type PlayState } from "../../app/services/room/ClientGameEventHandler.ts";

export interface ClientGame {
  id: string;
  playerId: string;
  events: PlayerEvent[];
  playState: PlayState;
  settings: GameSettings | null;
}

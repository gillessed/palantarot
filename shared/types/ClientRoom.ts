import { type PlayerEvent } from "../../server/play/model/GameEvents.ts";
import { type GameSettings } from "../../server/play/model/GameSettings.ts";
import { type ClientGame } from "./ClientGameTypes.ts";

export interface ClientRoom {
  readonly id: string;
  readonly playerId: string;
  readonly events: ReadonlyArray<PlayerEvent>;
  readonly playState: ClientGame;
  readonly settings: GameSettings | null;
}

import type { PlayerEvent } from "../../../server/play/model/GameEvents";
import type { ClientGameState } from "../../../shared/types/ClientGameState";

export interface GameEventHandler {
  handleEvent(event: PlayerEvent, gameState: ClientGameState): Promise<void>;
}

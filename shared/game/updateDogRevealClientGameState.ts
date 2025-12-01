import type { PlayerEvent } from "../../server/play/model/GameEvents";
import type { DogRevealClientGameState } from "../types/ClientGameState";
import { updateClientGameStateShowTrump } from "./updateClientGameStateShowTrump";

export function updateDogRevealClientGameState(
  state: DogRevealClientGameState,
  event: PlayerEvent
): DogRevealClientGameState {
  switch (event.type) {
    case "show_trump":
      return updateClientGameStateShowTrump(state, event);
    default:
      console.error("Got an unexpected event during dog reveal phase", event);
      throw Error("Got an unexpected event during dog reveal phase");
  }
}

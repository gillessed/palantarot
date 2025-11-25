import type { NewGameClientGameState } from "../types/ClientGameState";

export function createEmptyClientGameState(): NewGameClientGameState {
  return {
    phase: "new_game",
    playerOrder: [],
    readiedPlayers: new Set(),
  };
}

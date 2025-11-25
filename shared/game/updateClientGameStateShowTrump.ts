import type { ShowTrumpAction } from "../../server/play/model/GameEvents";
import type { ShowTrumpClientGameState } from "../types/ClientGameState";

export function updateClientGameStateShowTrump<
  T extends ShowTrumpClientGameState
>(state: T, action: ShowTrumpAction): T {
  const newShows = [
    ...state.shows,
    { player: action.playerId, trumpCards: action.cards },
  ];
  return {
    ...state,
    shows: newShows,
    showIndex: newShows.length - 1,
  };
}

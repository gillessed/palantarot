import { GameStartTransition } from "../../server/play/model/GameEvents";
import { DogRevealClientGameState, PartnerCallClientGameState, PlayingClientGameState } from "../types/ClientGameState";

export function updateClientGameStateStarted(
  state: PartnerCallClientGameState | DogRevealClientGameState,
  action: GameStartTransition
): PlayingClientGameState {
  return {
    ...state,
    phase: "playing",
    toPlay: action.first_player,
    anyPlayerPlayedCard: false,
    completedTricks: [],
    trick: {
      cards: new Map(),
      order: [],
    }
  };
}
import {
  type CallPartnerAction,
  type DogRevealTransition,
  type PlayerEvent,
} from "../../server/play/model/GameEvents.ts";
import type {
  ClientGameState,
  DogRevealClientGameState,
  PartnerCallClientGameState
} from "../types/ClientGameState.ts";
import { compareCards, DefaultCardComparator } from "../utils/compareCards.ts";
import { isCardEqual } from "../utils/isCardEqual.ts";
import { updateClientGameStateShowTrump } from "./updateClientGameStateShowTrump.ts";
import { updateClientGameStateStarted } from "./updateClientGameStateStarted.ts";

function callPartner(
  state: PartnerCallClientGameState,
  action: CallPartnerAction
): PartnerCallClientGameState {
  return {
    ...state,
    phase: "partner_call",
    partnerCard: action.card,
  };
}

function dogRevealed(
  state: PartnerCallClientGameState,
  action: DogRevealTransition
): DogRevealClientGameState {
  const selfCall = !!action.dog.find((card) =>
    isCardEqual(card, state.partnerCard)
  );
  const partner = selfCall ? state.winningBid?.player : undefined;

  return {
    ...state,
    phase: "dog_reveal",
    hand:
      state.hand.length > 0
        ? [...state.hand, ...action.dog].sort(DefaultCardComparator)
        : state.hand,
    partner,
    dog: action.dog,
  };
}

export function updatePartnerCallClientGameState(
  state: PartnerCallClientGameState,
  event: PlayerEvent
): ClientGameState {
  switch (event.type) {
    case "show_trump":
      return updateClientGameStateShowTrump(state, event);
    case "call_partner":
      return callPartner(state, event);
    case "dog_revealed":
      return dogRevealed(state, event);
    case "game_started":
      return updateClientGameStateStarted(state, event);
    default:
      console.error("Got an unexpected event during partner call phase", event);
      throw Error("Got an unexpected event during partner call phase");
  }
}

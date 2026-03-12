import type {
  GameStartTransition,
  PlayerEvent,
  SetDogAction,
} from "../../server/play/model/GameEvents";
import type {
  ClientGameState,
  DogRevealClientGameState,
  PlayingClientGameState,
} from "../types/ClientGameState";
import { cardsWithout } from "../utils/cardsWithout";
import { updateClientGameStateShowTrump } from "./updateClientGameStateShowTrump";

export function updateDogRevealClientGameState(
  state: DogRevealClientGameState,
  event: PlayerEvent,
): ClientGameState {
  switch (event.type) {
    case "show_trump":
      return updateClientGameStateShowTrump(state, event);
    case "set_dog":
      return updateClientGameStateSetDog(state, event);
    case "game_started":
      return updateClientGameStateStarted(state, event);
    default:
      console.error("Got an unexpected event during dog reveal phase", event);
      throw Error("Got an unexpected event during dog reveal phase");
  }
}

function updateClientGameStateSetDog(
  state: DogRevealClientGameState,
  action: SetDogAction,
): DogRevealClientGameState {
  if (action.exclude != null) {
    return {
      ...state,
      dog: action.dog,
      hand: cardsWithout(state.hand, ...action.dog),
    };
  } else {
    return {
      ...state,
      hand: cardsWithout(state.hand, ...action.dog),
    };
  }
}

function updateClientGameStateStarted(
  state: DogRevealClientGameState,
  action: GameStartTransition,
): PlayingClientGameState {
  return {
    ...state,
    phase: "playing",
    anyPlayerPlayedCard: false,
    toPlay: action.first_player,
    trick: {
      type: "in-progress",
      cards: new Map(),
      order: [],
    },
    completedTricks: [],
  };
}

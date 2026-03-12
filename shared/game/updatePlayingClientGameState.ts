import {
  CompletedTrickTransition,
  NotifyEvent,
  PlayCardAction,
  type PlayerEvent,
} from "../../server/play/model/GameEvents.ts";
import type {
  ClientGameState,
  PlayingClientGameState,
} from "../types/ClientGameState.ts";
import { ClientTrick } from "../types/ClientGameTypes.ts";
import { cardsWithout } from "../utils/cardsWithout.ts";
import { isCardEqual } from "../utils/isCardEqual.ts";
import { updateClientGameStateShowTrump } from "./updateClientGameStateShowTrump.ts";

function playCard(
  state: PlayingClientGameState,
  action: PlayCardAction,
): PlayingClientGameState {
  const playerIndex = state.playerOrder.indexOf(action.playerId) + 1;
  const toPlay = state.playerOrder[playerIndex % state.playerOrder.length];
  const newTrickCards = new Map(state.trick.cards);
  newTrickCards.set(action.playerId, action.card);
  const newOrder = [...(state.trick.order ?? []), action.playerId];
  const completed = state.playerOrder.length === newTrickCards.size;
  const newTrick: ClientTrick = {
    order: newOrder,
    cards: newTrickCards,
    completed,
  };
  let partner = state.partner;
  if (!partner && isCardEqual(state.partnerCard, action.card)) {
    partner = action.playerId;
  }

  return {
    ...state,
    hand: cardsWithout(state.hand, action.card),
    toPlay,
    trick: newTrick,
    partner,
    anyPlayerPlayedCard: true,
  };
}

function completedTrick(
  state: PlayingClientGameState,
  action: CompletedTrickTransition,
): PlayingClientGameState {
  return {
    ...state,
    completedTricks: [
      ...state.completedTricks,
      { ...state.trick, winner: action.winner },
    ],
    trick: {
      cards: new Map(),
      order: [],
      completed: false,
    },
    toPlay: action.winner,
  };
}

function notifyPlayer(
  state: PlayingClientGameState,
  event: NotifyEvent,
): PlayingClientGameState {
  return {
    ...state,
    // notifyPlayer: event.playerId,
  };
}

export function updatePlayingClientGameState(
  state: PlayingClientGameState,
  event: PlayerEvent,
): ClientGameState {
  switch (event.type) {
    case "show_trump":
      return updateClientGameStateShowTrump(state, event);
    case "play_card":
      return playCard(state, event);
    case "completed_trick":
      return completedTrick(state, event);
    // case "game_completed":
    //   return gameComplete(state, event);
    // case "game_aborted":
    //   return gameAborted(state, event);
    case "notify_player":
      return notifyPlayer(state, event);
    default:
      console.error("Got an unexpected event during playing phase", event);
      throw Error("Got an unexpected event during playing phase");
  }
}

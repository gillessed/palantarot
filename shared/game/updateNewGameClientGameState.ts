import pkg from "lodash";
import {
  type EnterGameAction,
  type LeaveGameAction,
  type PlayerEvent,
  type PlayerReadyAction,
  type PlayersSetTransition,
  type PlayerUnreadyAction,
} from "../../server/play/model/GameEvents.ts";
import type {
  BiddingClientGameState,
  ClientGameState,
  NewGameClientGameState,
} from "../types/ClientGameState.ts";

const { isEqual, without } = pkg;

function markPlayerReady(
  state: NewGameClientGameState,
  action: PlayerReadyAction
): NewGameClientGameState {
  return {
    ...state,
    readiedPlayers: new Set(state.readiedPlayers).add(action.playerId),
  };
}

function unmarkPlayerReady(
  state: NewGameClientGameState,
  action: PlayerUnreadyAction
): NewGameClientGameState {
  const newReadiedPlayers = new Set(state.readiedPlayers);
  newReadiedPlayers.delete(action.playerId);
  return {
    ...state,
    readiedPlayers: newReadiedPlayers,
  };
}

function enterGame(
  state: NewGameClientGameState,
  action: EnterGameAction
): NewGameClientGameState {
  return {
    ...state,
    playerOrder: [...state.playerOrder, action.playerId],
  };
}

function leaveGame(
  state: NewGameClientGameState,
  action: LeaveGameAction
): NewGameClientGameState {
  return {
    ...state,
    playerOrder: without(state.playerOrder, action.playerId),
  };
}

function playersSet(
  _: NewGameClientGameState,
  action: PlayersSetTransition
): BiddingClientGameState {
  return {
    hand: [],
    phase: "bidding",
    playerOrder: action.playerOrder,
    toBid: 0,
    playerBids: new Map(),
    shows: [],
    showIndex: null,
  };
}

export function updateNewGameClientGameState(
  state: NewGameClientGameState,
  event: PlayerEvent
): ClientGameState {
  switch (event.type) {
    case "mark_player_ready":
      return markPlayerReady(state, event);
    case "mark_player_unready":
      return unmarkPlayerReady(state, event);
    case "enter_game":
      return enterGame(state, event);
    case "leave_game":
      return leaveGame(state, event);
    case "players_set":
      return playersSet(state, event);
    default:
      console.error("Got an unexpected event during new game phase", event);
      throw Error("Got an unexpected event during new game phase");
  }
}

import {
  type BidAction,
  type BiddingCompletedTransition,
  type DealtHandTransition,
  type PlayerEvent,
} from "../../server/play/model/GameEvents.ts";
import type {
  BiddingClientGameState,
  ClientGameState,
  PartnerCallClientGameState,
} from "../types/ClientGameState.ts";
import { updateClientGameStateShowTrump } from "./updateClientGameStateShowTrump.ts";

export function dealtHand(
  state: BiddingClientGameState,
  action: DealtHandTransition
): BiddingClientGameState {
  return {
    ...state,
    hand: action.hand,
  };
  // TODO: observer state
  // if (action.playerId === playerId) {
  // else {
  //   const newHands = new Map(state.allHands);
  //   newHands.set(action.playerId, action.hand);
  //   return {
  //     ...state,
  //     allHands: newHands,
  //   };
  // }
}

export function bid(
  state: BiddingClientGameState,
  action: BidAction
): BiddingClientGameState {
  const newBids = new Map(state.playerBids);
  newBids.set(action.playerId, {
    player: action.playerId,
    bid: action.bid,
    calls: action.calls ?? [],
  });
  const passCount = [...state.playerBids.values()].reduce((acc, value) => {
    return acc + (value.bid === 0 ? 1 : 0);
  }, 0);
  if (state.playerOrder.length - passCount <= 1) {
    return {
      ...state,
      playerBids: newBids,
    };
  }
  let newBidder = state.toBid ?? 0;
  do {
    newBidder = (newBidder + 1) % state.playerOrder.length;
  } while (state.playerBids.get(state.playerOrder[newBidder])?.bid === 0);
  return {
    ...state,
    toBid: newBidder,
    playerBids: newBids,
  };
}

function biddingCompleted(
  state: BiddingClientGameState,
  action: BiddingCompletedTransition
): PartnerCallClientGameState {
  return {
    phase: "partner_call",
    hand: state.hand,
    playerOrder: state.playerOrder,
    shows: state.shows,
    showIndex: state.showIndex,
    winningBid: action.winning_bid,
  };
}

export function updateBiddingClientGameState(
  state: BiddingClientGameState,
  event: PlayerEvent
): ClientGameState {
  switch (event.type) {
    case "dealt_hand":
      return dealtHand(state, event);
    case "bid":
      return bid(state, event);
    case "show_trump":
      return updateClientGameStateShowTrump(state, event);
    case "bidding_completed":
      return biddingCompleted(state, event);
    default:
      console.error("Got an unexpected event during bidding phase", event);
      throw Error("Got an unexpected event during bidding phase");
  }
}

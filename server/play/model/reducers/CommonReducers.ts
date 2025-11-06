import { cardsEqual, getPlayerNum, getTrumps } from "../CardUtils.ts";
import { GameErrors } from "../GameErrors.ts";
import { type DeclareSlam, type PlayerEvent, type ShowTrumpAction } from "../GameEvents.ts";
import {
  type BoardState,
  type CompletedBids,
  type DealtBoardState,
  type PlayerId,
  type ReducerResult,
} from "../GameState.ts";

export const simpleResult = <RESULT extends BoardState>(
  state: RESULT,
  action: PlayerEvent,
  serverMessages?: string[]
): ReducerResult<RESULT> => ({
  state,
  events: [action],
  serverMessages,
});

export const showTrumpActionReducer = <T extends DealtBoardState>(
  state: T,
  action: ShowTrumpAction
): ReducerResult<T> => {
  const playerNum = getPlayerNum(state.players, action.player);
  if (state.shows.indexOf(action.player) >= 0) {
    throw GameErrors.cannotShowTwice(action.player);
  }
  if (!cardsEqual(getTrumps(state.hands[playerNum]), action.cards)) {
    throw GameErrors.invalidTrumpShow(action, getTrumps(state.hands[playerNum]));
  }
  if (state.players.length === 5 && action.cards.length < 8) {
    throw GameErrors.notEnoughTrump(action.cards.length, 8);
  }
  if (state.players.length < 5 && action.cards.length < 10) {
    throw GameErrors.notEnoughTrump(action.cards.length, 10);
  }
  const newState: T = {
    ...state,
    shows: [...state.shows, action.player],
  };
  return simpleResult(newState, action);
};

export const declareSlamActionReducer = <T extends DealtBoardState & { bidder: PlayerId; bidding: CompletedBids }>(
  state: T,
  action: DeclareSlam
): ReducerResult<T> => {
  const player_num = getPlayerNum(state.players, action.player);
  if (action.player != state.bidder) {
    throw GameErrors.onlyBidderCanDeclareSlam(action.player, state.bidder);
  }
  const newState: T = {
    ...state,
    bidding: {
      ...state.bidding,
      calls: {
        ...state.bidding.calls,
        [player_num]: [...state.bidding.calls[player_num], "declared_slam"],
      },
    },
  };
  return simpleResult(newState, action);
};

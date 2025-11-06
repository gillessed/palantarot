import { cardsContain } from "../CardUtils.ts";
import { GameErrors } from "../GameErrors.ts";
import { type CallPartnerAction, type DogRevealTransition, type GameStartTransition } from "../GameEvents.ts";
import {
  type DogRevealAndExchangeBoardState,
  type PartnerCallBoardState,
  type PartnerCallStateActions,
  type PartnerCallStates,
  type PlayingBoardState,
  type ReducerResult,
} from "../GameState.ts";
import { declareSlamActionReducer, showTrumpActionReducer } from "./CommonReducers.ts";
import { getNewTrick } from "./Utils.ts";

const handleCallPartnerAction = (
  state: PartnerCallBoardState,
  action: CallPartnerAction
): ReducerResult<PartnerCallStates> => {
  if (action.player !== state.bidder) {
    throw GameErrors.cannotCallPartnerIfNotBidder(action.player, state.bidder);
  }
  if (action.card[0] === "T") {
    throw GameErrors.cannotCallTrump(action.card);
  }

  let partner = undefined;
  for (const player_num in state.hands) {
    if (cardsContain(state.hands[player_num], action.card)) {
      partner = state.players[player_num];
      break;
    }
  }
  if (state.bidding.winningBid.bid > 40) {
    const newState: PlayingBoardState = {
      ...state,
      name: "playing",
      called: action.card,
      partner,

      current_trick: getNewTrick(state.players, state.players[0], 0),
      past_tricks: [],
    };
    const gameStartedTransition: GameStartTransition = {
      type: "game_started",
      first_player: state.players[0],
      privateTo: undefined,
    };
    return { state: newState, events: [action, gameStartedTransition] };
  } else {
    const newState: DogRevealAndExchangeBoardState = {
      ...state,
      name: "dog_reveal",
      called: action.card,
      partner,
    };
    const dogRevealTransition: DogRevealTransition = {
      type: "dog_revealed",
      dog: state.dog,
      player: state.bidder,
      privateTo: undefined,
    };
    return { state: newState, events: [action, dogRevealTransition] };
  }
};

export const PartnerCallGameStateReducer = (
  state: PartnerCallBoardState,
  action: PartnerCallStateActions
): ReducerResult<PartnerCallStates> => {
  switch (action.type) {
    case "declare_slam":
      return declareSlamActionReducer(state, action);
    case "show_trump":
      return showTrumpActionReducer(state, action);
    case "call_partner":
      return handleCallPartnerAction(state, action);
    default:
      throw GameErrors.invalidActionForGameState(action, state.name);
  }
};

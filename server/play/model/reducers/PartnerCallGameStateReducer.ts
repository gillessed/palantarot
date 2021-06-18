import { TrumpSuit } from '../Card';
import { cardsContain } from '../CardUtils';
import { GameErrors } from '../GameErrors';
import { CallPartnerAction, DogRevealTransition, GameStartTransition } from '../GameEvents';
import { BidValue, DogRevealAndExchangeBoardState, GameplayState, PartnerCallBoardState, PartnerCallStateActions, PartnerCallStates, PlayingBoardState, ReducerResult } from "../GameState";
import { declareSlamActionReducer, showTrumpActionReducer } from './CommonReducers';
import { getNewTrick } from './Utils';

const handleCallPartnerAction = (state: PartnerCallBoardState, action: CallPartnerAction): ReducerResult<PartnerCallStates> => {
  if (action.player !== state.bidder) {
    throw GameErrors.cannotCallPartnerIfNotBidder(action.player, state.bidder);
  } 
  if (action.card[0] === TrumpSuit) {
    throw GameErrors.cannotCallTrump(action.card);
  }

  let partner = undefined;
  for (const player_num in state.hands) {
    if (cardsContain(state.hands[player_num], action.card)) {
      partner = state.players[player_num];
      break;
    }
  }
  if (state.bidding.winningBid.bid > BidValue.FORTY) {
    const newState: PlayingBoardState = {
      ...state,
      name: GameplayState.Playing,
      called: action.card,
      partner,

      current_trick: getNewTrick(state.players, state.players[0], 0),
      past_tricks: [],
    };
    const gameStartedTransition: GameStartTransition = {
      type: 'game_started',
      first_player: state.players[0],
      privateTo: undefined,
    };
    return { state: newState, events: [action, gameStartedTransition] };
  } else {
    const newState: DogRevealAndExchangeBoardState = {
      ...state,
      name: GameplayState.DogReveal,
      called: action.card,
      partner,
    };
    const dogRevealTransition: DogRevealTransition = {
      type: 'dog_revealed',
      dog: state.dog,
      player: state.bidder,
      privateTo: undefined,
    };
    return { state: newState, events: [action, dogRevealTransition] };
  }
}

export const PartnerCallGameStateReducer = (state: PartnerCallBoardState, action: PartnerCallStateActions): ReducerResult<PartnerCallStates> => {
  switch (action.type) {
    case "declare_slam": return declareSlamActionReducer(state, action);
    case "show_trump": return showTrumpActionReducer(state, action);
    case "call_partner": return handleCallPartnerAction(state, action);
    default: throw GameErrors.invalidActionForGameState(action, state.name);
  }
};

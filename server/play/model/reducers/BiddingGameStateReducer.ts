import { getPlayerNum } from '../CardUtils';
import { GameErrors } from '../GameErrors';
import { BidAction, BiddingCompletedTransition, DogRevealTransition, GameAbortedTransition, GameStartTransition, PlayerEvent } from "../GameEvents";
import { Bid, BiddingBoardState, BiddingStateActions, BiddingStates, BidValue, Call, CurrentBids, DogRevealAndExchangeBoardState, GameplayState, NewGameBoardState, PartnerCallBoardState, PlayerId, PlayingBoardState, ReducerResult } from "../GameState";
import { showTrumpActionReducer, simpleResult } from './CommonReducers';
import { getNewTrick, getStringForBid } from './Utils';

const  getAllCalls = (players: PlayerId[], bidding: CurrentBids): { [player: number]: Call[] } => {
  const calls: { [player: number]: Call[] } = {};
  for (const bid of bidding.bids) {
    const playerNum = getPlayerNum(players, bid.player);
    if (!calls[playerNum]) {
      calls[playerNum] = []
    }
    calls[playerNum].push(...bid.calls)
  }
  return calls;
}

const updateBids = (state: CurrentBids, bid: Bid): CurrentBids => {
  if (state.bidders[0] !== bid.player) {
    throw GameErrors.biddingOutOfTurn(bid.player, state.bidders[0])
  } else if (bid.calls.indexOf(Call.RUSSIAN) !== -1 && bid.bid !== BidValue.TWENTY) {
    throw GameErrors.canOnlyCallRussianOnTwenties(bid);
  } else if (bid.bid === BidValue.PASS || bid.bid === undefined) {
    const bidders = state.bidders.slice(1);
    if (bidders.length == 1 && state.current_high.player === bidders[0]) {
      bidders.pop(); // all pass, only most recent bidder left -> bidding done.
    }
    return {
      bids: [...state.bids, bid],
      bidders,
      current_high: state.current_high,
    }
  } else if (state.current_high.bid >= bid.bid) {
    throw GameErrors.bidTooLow(bid.bid, state.current_high.bid);
  } else { // new bid is high
    const bidders = [...state.bidders];
    bidders.push(bidders.shift()!);
    if (bidders.length == 1) {
      bidders.pop(); // all pass, only most recent bidder left -> bidding done.
    }
    return {
      bids: [...state.bids, bid],
      bidders,
      current_high: bid,
    }
  }
};

const handleAllPasses = (state: BiddingBoardState, action: BidAction): ReducerResult<BiddingStates> => {
  const newState: NewGameBoardState = {
    publicHands: state.publicHands,
    name: GameplayState.NewGame,
    players: state.players,
    ready: [],
  };
  const abortTransition: GameAbortedTransition = {
    type: 'game_aborted',
    reason: 'Everybody passed!',
  };
  const events = [action, abortTransition];
  return { state: newState, events };
}

const handleBidAction = (state: BiddingBoardState, action: BidAction): ReducerResult<BiddingStates> => {
  const bid: Bid = {
    ...action,
    calls: action.calls || []
  };
  const newBidState = updateBids(state.bidding, bid);
  if (newBidState.bidders.length > 0 && action.bid !== BidValue.ONESIXTY) {
    const newState: BiddingBoardState = {
      ...state,
      bidding: newBidState,
    };
    const bidMessage = `{${action.player}} bid ${getStringForBid(bid)}`;
    return simpleResult(newState, action, [bidMessage]);
  } else { // last bid
    if (newBidState.current_high.bid === BidValue.PASS) { // all passes
      return handleAllPasses(state, action);
    } else {
      let newState: PartnerCallBoardState | DogRevealAndExchangeBoardState | PlayingBoardState;
      const biddingCompletedTransition: BiddingCompletedTransition = {
        type: 'bidding_completed',
        winning_bid: newBidState.current_high,
        privateTo: undefined,
      };
      const events: PlayerEvent[] = [action, biddingCompletedTransition];
      if (state.players.length === 5) {
        newState = {
          ...state,
          name: GameplayState.PartnerCall,
          bidder: newBidState.current_high.player,
          allBids: newBidState.bids,
          bidding: {
            winningBid: newBidState.current_high,
            calls: getAllCalls(state.players, newBidState),
          },
        };
      } else { // 3 or 4 players
        if (newBidState.current_high.bid <= BidValue.FORTY) {
          newState = {
            ...state,
            name: GameplayState.DogReveal,
            bidder: newBidState.current_high.player,
            allBids: newBidState.bids,
            bidding: {
              winningBid: newBidState.current_high,
              calls: getAllCalls(state.players, newBidState),
            },
          };
          const dogRevealTransition: DogRevealTransition = {
            type: 'dog_revealed',
            dog: state.dog,
            player: newBidState.current_high.player,
            privateTo: undefined,
          };
          events.push(dogRevealTransition);
        } else { // 80 or 160 bid
          const bidder = newBidState.current_high.player;
          newState = {
            ...state,
            name: GameplayState.Playing,
            bidder,
            allBids: newBidState.bids,
            bidding: {
              winningBid: newBidState.current_high,
              calls: getAllCalls(state.players, newBidState),
            },
            current_trick: getNewTrick(state.players, state.players[0], 0),
            past_tricks: [],
          };
          const gameStartedTransition: GameStartTransition = {
            type: 'game_started',
            first_player: state.players[0],
            privateTo: undefined,
          }
          events.push(gameStartedTransition);
        }
      }
      const bidMessage = `{${action.player}} ${getStringForBid(bid)}`;
      const winnerMessage = `{${newState.bidder}} has won the bid`;
      return { state: newState, events, serverMessages: [bidMessage, winnerMessage] };
    }
  }
}

export const BiddingGameStateReducer = (state: BiddingBoardState, action: BiddingStateActions): ReducerResult<BiddingStates> => {
  switch (action.type) {
    case "show_trump": return showTrumpActionReducer(state, action);
    case "bid": return handleBidAction(state, action);
    default: throw GameErrors.invalidActionForGameState(action, state.name);
  }
};

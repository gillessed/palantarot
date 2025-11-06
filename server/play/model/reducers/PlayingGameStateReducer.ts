import { compact, findIndex, isEqual } from "lodash";
import { TheJoker } from "../Card.ts";
import { cardsContain, cardsWithout, getCardsAllowedToPlay, getPlayerNum, getWinner } from "../CardUtils.ts";
import { GameErrors } from "../GameErrors.ts";
import { getBaseScore, getEarnings, getFinalScore, getOutcomes } from "../GameEvaluation.ts";
import {
  type Action,
  type CompletedTrickTransition,
  type GameCompletedTransition,
  type PlayCardAction,
} from "../GameEvents";
import {
  type CompletedBoardState,
  type CompletedGameState,
  GameplayState,
  type PlayingBoardState,
  type PlayingStateActions,
  type PlayingStates,
  type ReducerResult,
} from "../GameState";
import { declareSlamActionReducer, showTrumpActionReducer, simpleResult } from "./CommonReducers.ts";
import { getNewTrick } from "./Utils.ts";

const isAfterFirstTurn = (state: PlayingBoardState, action: Action) => {
  return (
    state.past_tricks.length > 0 ||
    state.current_trick.players.slice(state.current_trick.current_player).indexOf(action.player) == -1
  );
};

export const handlePlayCardAction = (
  state: PlayingBoardState,
  action: PlayCardAction
): ReducerResult<PlayingStates> => {
  const player_num = getPlayerNum(state.players, action.player);
  const anyPlayerPlayedCard = !(state.current_trick.trick_num === 0 && state.current_trick.cards.length === 0);
  const allowedCards = getCardsAllowedToPlay(
    state.hands[player_num],
    state.current_trick.cards,
    anyPlayerPlayedCard,
    state.called
  );

  if (state.current_trick.players[state.current_trick.current_player] !== action.player) {
    throw GameErrors.playingOutOfTurn(action.player, state.current_trick.players[state.current_trick.current_player]);
  }
  if (!cardsContain(state.hands[player_num], action.card)) {
    throw GameErrors.cardNotInHand(action, state.hands[player_num]);
  }
  if (!cardsContain(allowedCards, action.card)) {
    throw GameErrors.cannotPlayCard(action.card, state.current_trick.cards, allowedCards);
  }
  if (
    !isAfterFirstTurn(state, action) &&
    player_num === 0 &&
    state.called &&
    action.card[0] === state.called[0] &&
    action.card[1] !== state.called[1]
  ) {
    throw GameErrors.cannotLeadCalledSuit(action.card, state.called);
  }

  const hands = {
    ...state.hands,
    [player_num]: cardsWithout(state.hands[player_num], action.card),
  };
  if (state.current_trick.current_player < state.current_trick.players.length - 1) {
    const newState: PlayingBoardState = {
      ...state,
      hands,
      current_trick: {
        ...state.current_trick,
        cards: [...state.current_trick.cards, action.card],
        current_player: state.current_trick.current_player + 1,
      },
    };
    return simpleResult(newState, action);
  } else {
    // last card in trick
    const new_cards = [...state.current_trick.cards, action.card];
    const [winning_card, winner] = getWinner(new_cards, state.current_trick.players);
    const completed_trick = {
      trick_num: state.current_trick.trick_num,
      cards: new_cards,
      players: state.current_trick.players,
      winner,
    };
    let jokerState;
    if (cardsContain(completed_trick.cards, TheJoker) && hands[0].length > 0) {
      // joker is not kept on last trick
      jokerState = {
        player: completed_trick.players[findIndex(completed_trick.cards, (card) => isEqual(card, TheJoker))],
        owed_to: winner,
      };
    }
    if (hands[0].length > 0) {
      // next trick!
      const newState: PlayingBoardState = {
        ...state,
        hands,
        jokerState: state.jokerState || jokerState,
        current_trick: getNewTrick(state.players, winner, completed_trick.trick_num + 1),
        past_tricks: [...state.past_tricks, completed_trick],
      };
      const completedTrickTransition: CompletedTrickTransition = {
        type: "completed_trick",
        winner,
        winning_card,
        jokerState,
        privateTo: undefined,
      };
      return { state: newState, events: [action, completedTrickTransition] };
    } else {
      // end of game!
      const tricks = [...state.past_tricks, completed_trick];
      const biddingTeam = compact([state.bidder, state.partner]);
      const earnings = getEarnings(biddingTeam, tricks, state.bidding.winningBid.bid, state.dog, state.jokerState);
      const baseScore = getBaseScore(state.bidding.winningBid.bid, earnings);
      const outcomes = getOutcomes(state.players, biddingTeam, tricks);
      const finalScore = getFinalScore(
        state.players,
        biddingTeam,
        earnings,
        baseScore,
        state.shows,
        state.bidding.calls,
        outcomes
      );
      const endState: CompletedGameState = {
        players: state.players,
        bidder: state.bidder,
        bid: state.bidding.winningBid.bid,
        partner: state.partner,
        dog: state.dog,
        calls: state.bidding.calls,
        shows: state.shows,
        outcomes,
        ...finalScore,
      };
      const newBoardState: CompletedBoardState = {
        ...state,
        name: GameplayState.Completed,
        jokerState: state.jokerState || jokerState,
        past_tricks: tricks,
        end_state: endState,
      };
      const completedTrickTransition: CompletedTrickTransition = {
        type: "completed_trick",
        winner,
        winning_card,
        jokerState,
        privateTo: undefined,
      };
      const completedGameTransition: GameCompletedTransition = {
        type: "game_completed",
        end_state: endState,
        privateTo: undefined,
      };
      const completedGameMessage = "The game is over";
      return {
        state: newBoardState,
        events: [action, completedTrickTransition, completedGameTransition],
        serverMessages: [completedGameMessage],
      };
    }
  }
};

export const PlayingGameStateReducer = (
  state: PlayingBoardState,
  action: PlayingStateActions
): ReducerResult<PlayingStates> => {
  switch (action.type) {
    case "declare_slam":
      if (isAfterFirstTurn(state, action)) {
        throw GameErrors.afterFirstTurn(action);
      }
      return declareSlamActionReducer(state, action);
    case "show_trump":
      if (isAfterFirstTurn(state, action)) {
        throw GameErrors.afterFirstTurn(action);
      }
      return showTrumpActionReducer(state, action);
    case "play_card":
      return handlePlayCardAction(state, action);
    default:
      throw GameErrors.invalidActionForGameState(action, state.name);
  }
};

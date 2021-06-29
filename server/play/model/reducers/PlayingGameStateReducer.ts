
import _ from "lodash";
import { Bout, Card, Suit, TheJoker, TheOne, TrumpValue } from "../Card";
import { cardsContain, cardsWithout, getCardPoint, getCardsAllowedToPlay, getPlayerNum, getWinner } from '../CardUtils';
import { GameErrors } from '../GameErrors';
import { Action, CompletedTrickTransition, GameCompletedTransition, PlayCardAction } from "../GameEvents";
import { BidValue, Call, CompletedBoardState, CompletedGameState, CompletedTrick, GameplayState, JokerExchangeState, Outcome, PlayerId, PlayingBoardState, PlayingStateActions, PlayingStates, ReducerResult, ShowTrumpState } from "../GameState";
import { declareSlamActionReducer, showTrumpActionReducer, simpleResult } from './CommonReducers';
import { getNewTrick } from "./Utils";

const isAfterFirstTurn = (state: PlayingBoardState, action: Action) => {
  return state.past_tricks.length > 0 || state.current_trick.players.slice(state.current_trick.current_player).indexOf(action.player) == -1;
}

const getCardsWon = (bidding_team: PlayerId[], tricks: CompletedTrick[], joker_state?: JokerExchangeState): Card[] => {
  const cardswon = [];
  const cardsLost = [];
  for (const trick of tricks) {
    if (bidding_team.indexOf(trick.winner) > -1) { // bidding team won
      cardswon.push(...trick.cards);
    } else {
      cardsLost.push(...trick.cards);
    }
  }

  if (joker_state) {
    if ((bidding_team.indexOf(joker_state.player) > -1) !== (bidding_team.indexOf(joker_state.owed_to) > -1)) {
      if (bidding_team.indexOf(joker_state.player) > -1) { // joker played by bidder/partner, need to swap it back
        if (cardswon.length > 0) {
          cardsLost.push(_.sortBy(cardswon, getCardPoint)[0]);
          cardswon.push(..._.remove(cardsLost, (card) => _.isEqual(card, TheJoker)));
        }
      } else { // joker played by team, need to swap it back
        if (cardsLost.length > 0) {
          cardswon.push(_.sortBy(cardsLost, getCardPoint)[0]);
          cardsLost.push(..._.remove(cardswon, (card) => _.isEqual(card, TheJoker)));
        }
      }
    }
  }
  return cardswon
}

const getOutcomes = (
  players: PlayerId[],
  biddingTeam: PlayerId[],
  tricks: CompletedTrick[],
): { [player: number]: Outcome[] } => {
  const outcomes: { [player: number]: Outcome[] } = {};

  const tricks_won = tricks
    .filter((trick) => biddingTeam.indexOf(trick.winner) > -1)
    .length;
  if (tricks_won === tricks.length) {
    for (const player of biddingTeam) {
      outcomes[players.indexOf(player)] = [Outcome.SLAMMED]
    }
  } else if (tricks_won === 0) {
    for (const player_num of players.keys()) {
      if (biddingTeam.indexOf(players[player_num]) === -1) {
        outcomes[player_num] = [Outcome.SLAMMED]
      }
    }
  }

  if (cardsContain(tricks[tricks.length - 1].cards, TheOne)) {
    const one_last = players.indexOf(tricks[tricks.length - 1].winner);
    if (outcomes[one_last] === undefined) {
      outcomes[one_last] = []
    }
    outcomes[one_last].push(Outcome.ONE_LAST);
  }

  return outcomes;
}

const getFinalScore = (
  players: PlayerId[],
  biddingTeam: PlayerId[],
  bid: BidValue,
  cardsWon: Card[],
  dog: Card[],
  shows: ShowTrumpState,
  calls: { [player: number]: Call[] },
  outcomes: { [player: number]: Outcome[] },
): { pointsEarned: number, bouts: Bout[], bidderWon: boolean, pointsResult: number } => {
  const bouts = _.filter(cardsWon, (card): card is Bout =>
    card[0] === Suit.Trump && (
      card[1] === TrumpValue.Joker || card[1] === TrumpValue._1 || card[1] === TrumpValue._21));
  const trickPoints = cardsWon.map(getCardPoint).reduce((a, b) => a + b, 0);
  const dogPoints = dog.map(getCardPoint).reduce((a, b) => a + b, 0);
  const pointsEarned = trickPoints + (dogPoints * (bid !== BidValue.ONESIXTY ? 1 : 0));
  const neededToWin = [56, 51, 41, 36][bouts.length];
  const bidderWon = pointsEarned >= neededToWin;

  let pointsResult = bid;
  pointsResult += Math.ceil(Math.abs(pointsEarned - neededToWin) / 10) * 10;
  for (const player of shows) {
    pointsResult += 10;
  }
  pointsResult *= bidderWon ? 1 : -1;

  for (const playerNum in calls) {
    if (calls[playerNum].indexOf(Call.DECLARED_SLAM) > -1) {
      let points = 200;
      points *= outcomes[playerNum].indexOf(Outcome.SLAMMED) > -1 ? 1 : -1;
      points *= biddingTeam.indexOf(players[playerNum]) > -1 ? 1 : -1;
      pointsResult += points;
    }
  }

  for (const playerNum in outcomes) {
    if (outcomes[playerNum].indexOf(Outcome.SLAMMED) > -1) {
      pointsResult += biddingTeam.indexOf(players[playerNum]) > -1 ? 200 : -200;
      break;
    }
  }

  for (const playerNum in outcomes) {
    if (outcomes[playerNum].indexOf(Outcome.ONE_LAST) > -1) {
      pointsResult += biddingTeam.indexOf(players[playerNum]) > -1 ? 10 : -10;
      break;
    }
  }

  return {
    pointsEarned,
    bouts,
    bidderWon: bidderWon,
    pointsResult,
  }
}

export const handlePlayCardAction = (state: PlayingBoardState, action: PlayCardAction): ReducerResult<PlayingStates> => {
  const player_num = getPlayerNum(state.players, action.player);
  const anyPlayerPlayedCard = !(state.current_trick.trick_num === 0 && state.current_trick.cards.length === 0);
  const allowedCards = getCardsAllowedToPlay(state.hands[player_num], state.current_trick.cards, anyPlayerPlayedCard, state.called);

  if (state.current_trick.players[state.current_trick.current_player] !== action.player) {
    throw GameErrors.playingOutOfTurn(action.player, state.current_trick.players[state.current_trick.current_player]);
  }
  if (!cardsContain(state.hands[player_num], action.card)) {
    throw GameErrors.cardNotInHand(action, state.hands[player_num]);
  } 
  if (!cardsContain(allowedCards, action.card)) {
    throw GameErrors.cannotPlayCard(action.card, state.current_trick.cards, allowedCards);
  } 
  if (!isAfterFirstTurn(state, action) && player_num === 0 && state.called
    && action.card[0] === state.called[0] && action.card[1] !== state.called[1]) {
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
  } else { // last card in trick
    const new_cards = [...state.current_trick.cards, action.card];
    const [winning_card, winner] = getWinner(new_cards, state.current_trick.players);
    const completed_trick = {
      trick_num: state.current_trick.trick_num,
      cards: new_cards,
      players: state.current_trick.players,
      winner,
    };
    let joker_state;
    if (cardsContain(completed_trick.cards, TheJoker) && hands[0].length > 0) { // joker is not kept on last trick
      joker_state = {
        player: completed_trick.players[_.findIndex(completed_trick.cards, (card) => _.isEqual(card, TheJoker))],
        owed_to: winner,
      };
    }
    if (hands[0].length > 0) { // next trick!
      const newState: PlayingBoardState = {
        ...state,
        hands,
        joker_state: state.joker_state || joker_state,
        current_trick: getNewTrick(state.players, winner, completed_trick.trick_num + 1),
        past_tricks: [...state.past_tricks, completed_trick],
      }
      const completedTrickTransition: CompletedTrickTransition = {
        type: 'completed_trick',
        winner,
        winning_card,
        joker_state,
        privateTo: undefined,
      };
      return { state: newState, events: [action, completedTrickTransition] };
    } else { // end of game!
      const tricks = [...state.past_tricks, completed_trick];
      const bidding_team = _.compact([state.bidder, state.partner]);
      const cards_won = getCardsWon(bidding_team, tricks, state.joker_state);
      const outcomes = getOutcomes(state.players, bidding_team, tricks);
      const final_score = getFinalScore(
        state.players,
        bidding_team,
        state.bidding.winningBid.bid,
        cards_won,
        state.dog,
        state.shows,
        state.bidding.calls,
        outcomes,
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
        ...final_score
      };
      const newBoardState: CompletedBoardState = {
        ...state,
        name: GameplayState.Completed,
        joker_state: state.joker_state || joker_state,
        past_tricks: tricks,
        end_state: endState,
      }
      const completedTrickTransition: CompletedTrickTransition = {
        type: 'completed_trick',
        winner,
        winning_card,
        joker_state,
        privateTo: undefined,
      };
      const completedGameTransition: GameCompletedTransition = {
        type: 'game_completed',
        end_state: endState,
        privateTo: undefined,
      };
      const completedGameMessage = 'The game is over';
      return { state: newBoardState, events: [action, completedTrickTransition, completedGameTransition], serverMessages: [completedGameMessage] };
    }
  }
}

export const PlayingGameStateReducer = (state: PlayingBoardState, action: PlayingStateActions): ReducerResult<PlayingStates> => {
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
    case "play_card": return handlePlayCardAction(state, action);
    default:
      throw GameErrors.invalidActionForGameState(action, state.name);
  }
};

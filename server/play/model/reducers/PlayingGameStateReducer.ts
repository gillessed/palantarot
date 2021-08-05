import {compact, filter, findIndex, isEqual, remove, sortBy} from 'lodash';
import {Bout, Card, Suit, TheJoker, TheOne, TrumpValue} from '../Card';
import {
  cardsContain,
  cardsWithout,
  compareCards,
  getCardPoint,
  getCardsAllowedToPlay,
  getPlayerNum,
  getWinner,
} from '../CardUtils';
import {GameErrors} from '../GameErrors';
import {
  Action,
  CompletedTrickTransition,
  GameCompletedTransition,
  PlayCardAction,
} from '../GameEvents';
import {
  BidValue,
  Call,
  CompletedBoardState,
  CompletedGameState,
  CompletedTrick,
  GameplayState,
  JokerExchangeState,
  Outcome,
  PlayerId,
  PlayingBoardState,
  PlayingStateActions,
  PlayingStates,
  ReducerResult,
  ShowTrumpState,
} from '../GameState';
import {
  declareSlamActionReducer,
  showTrumpActionReducer,
  simpleResult,
} from './CommonReducers';
import {getNewTrick} from './Utils';

const isAfterFirstTurn = (state: PlayingBoardState, action: Action) => {
  return (
    state.past_tricks.length > 0 ||
    state.current_trick.players
      .slice(state.current_trick.current_player)
      .indexOf(action.player) == -1
  );
};

interface Earnings {
  pointsEarned: number;
  bouts: Bout[];
}

const getEarnings = (
  biddingTeam: PlayerId[],
  tricks: CompletedTrick[],
  bid: BidValue,
  dog: Card[],
  jokerState?: JokerExchangeState
): Earnings => {
  const cardsWon = [];
  // we only track cards lost for joker exchange
  const cardsLost = [];
  for (const trick of tricks) {
    if (biddingTeam.indexOf(trick.winner) > -1) {
      // bidding team won
      cardsWon.push(...trick.cards);
    } else {
      cardsLost.push(...trick.cards);
    }
  }

  let pointsCollected = cardsWon.map(getCardPoint).reduce((a, b) => a + b, 0);

  if (jokerState) {
    if (
      biddingTeam.indexOf(jokerState.player) > -1 !==
      biddingTeam.indexOf(jokerState.owed_to) > -1
    ) {
      if (biddingTeam.indexOf(jokerState.player) > -1) {
        // joker played by bidder/partner, need to swap it back
        if (cardsWon.length > 0) {
          cardsWon.push(TheJoker);
          // trade half point card for 4.5 point card
          pointsCollected += 4;
        }
      } else {
        // joker played by opposition, need to swap it back
        if (cardsLost.length > 0) {
          remove(cardsWon, card => isEqual(card, TheJoker));
          // trade 4.5 point card for half point card
          pointsCollected -= 4;
        }
      }
    }
  }
  const bouts = filter(
    cardsWon,
    (card): card is Bout =>
      card[0] === Suit.Trump &&
      (card[1] === TrumpValue.Joker ||
        card[1] === TrumpValue._1 ||
        card[1] === TrumpValue._21)
  );
  const dogPoints = dog.map(getCardPoint).reduce((a, b) => a + b, 0);
  const pointsEarned =
    pointsCollected + dogPoints * (bid !== BidValue.ONESIXTY ? 1 : 0);
  return {
    pointsEarned,
    bouts,
  };
};

const getBaseScore = (bid: BidValue, earnings: Earnings): number => {
  const neededToWin = [56, 51, 41, 36][earnings.bouts.length];
  let baseScore = bid;
  baseScore +=
    Math.ceil(Math.abs(earnings.pointsEarned - neededToWin) / 10) * 10;
  const bidderWon = earnings.pointsEarned >= neededToWin;
  baseScore *= bidderWon ? 1 : -1;
  return baseScore;
};

const getOutcomes = (
  players: PlayerId[],
  biddingTeam: PlayerId[],
  tricks: CompletedTrick[]
): {[player: number]: Outcome[]} => {
  const outcomes: {[player: number]: Outcome[]} = {};

  const tricks_won = tricks.filter(
    trick => biddingTeam.indexOf(trick.winner) > -1
  ).length;
  if (tricks_won === tricks.length) {
    for (const player of biddingTeam) {
      outcomes[players.indexOf(player)] = [Outcome.SLAMMED];
    }
  } else if (tricks_won === 0) {
    for (const player_num of players.keys()) {
      if (biddingTeam.indexOf(players[player_num]) === -1) {
        outcomes[player_num] = [Outcome.SLAMMED];
      }
    }
  }

  if (cardsContain(tricks[tricks.length - 1].cards, TheOne)) {
    const one_last = players.indexOf(tricks[tricks.length - 1].winner);
    if (outcomes[one_last] === undefined) {
      outcomes[one_last] = [];
    }
    outcomes[one_last].push(Outcome.ONE_LAST);
  }

  return outcomes;
};

interface FinalScore {
  pointsEarned: number;
  bouts: Bout[];
  bidderWon: boolean;
  pointsResult: number;
}

const getFinalScore = (
  players: PlayerId[],
  biddingTeam: PlayerId[],
  bid: BidValue,
  earnings: Earnings,
  baseScore: number,
  shows: ShowTrumpState,
  calls: {[player: number]: Call[]},
  outcomes: {[player: number]: Outcome[]}
): FinalScore => {
  const bidderWon = Math.sign(baseScore) > 0;
  let pointsResult = baseScore;
  for (const player of shows) {
    pointsResult += 10;
  }

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
    pointsEarned: earnings.pointsEarned,
    bouts: earnings.bouts,
    bidderWon,
    pointsResult,
  };
};

export const handlePlayCardAction = (
  state: PlayingBoardState,
  action: PlayCardAction
): ReducerResult<PlayingStates> => {
  const player_num = getPlayerNum(state.players, action.player);
  const anyPlayerPlayedCard = !(
    state.current_trick.trick_num === 0 &&
    state.current_trick.cards.length === 0
  );
  const allowedCards = getCardsAllowedToPlay(
    state.hands[player_num],
    state.current_trick.cards,
    anyPlayerPlayedCard,
    state.called
  );

  if (
    state.current_trick.players[state.current_trick.current_player] !==
    action.player
  ) {
    throw GameErrors.playingOutOfTurn(
      action.player,
      state.current_trick.players[state.current_trick.current_player]
    );
  }
  if (!cardsContain(state.hands[player_num], action.card)) {
    throw GameErrors.cardNotInHand(action, state.hands[player_num]);
  }
  if (!cardsContain(allowedCards, action.card)) {
    throw GameErrors.cannotPlayCard(
      action.card,
      state.current_trick.cards,
      allowedCards
    );
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
  if (
    state.current_trick.current_player <
    state.current_trick.players.length - 1
  ) {
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
    const [winning_card, winner] = getWinner(
      new_cards,
      state.current_trick.players
    );
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
        player:
          completed_trick.players[
            findIndex(completed_trick.cards, card => isEqual(card, TheJoker))
          ],
        owed_to: winner,
      };
    }
    if (hands[0].length > 0) {
      // next trick!
      const newState: PlayingBoardState = {
        ...state,
        hands,
        jokerState: state.jokerState || jokerState,
        current_trick: getNewTrick(
          state.players,
          winner,
          completed_trick.trick_num + 1
        ),
        past_tricks: [...state.past_tricks, completed_trick],
      };
      const completedTrickTransition: CompletedTrickTransition = {
        type: 'completed_trick',
        winner,
        winning_card,
        jokerState,
        privateTo: undefined,
      };
      return {state: newState, events: [action, completedTrickTransition]};
    } else {
      // end of game!
      const tricks = [...state.past_tricks, completed_trick];
      const biddingTeam = compact([state.bidder, state.partner]);
      const earnings = getEarnings(
        biddingTeam,
        tricks,
        state.bidding.winningBid.bid,
        state.dog,
        state.jokerState
      );
      const baseScore = getBaseScore(state.bidding.winningBid.bid, earnings);
      const outcomes = getOutcomes(state.players, biddingTeam, tricks);
      const finalScore = getFinalScore(
        state.players,
        biddingTeam,
        state.bidding.winningBid.bid,
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
        type: 'completed_trick',
        winner,
        winning_card,
        jokerState,
        privateTo: undefined,
      };
      const completedGameTransition: GameCompletedTransition = {
        type: 'game_completed',
        end_state: endState,
        privateTo: undefined,
      };
      const completedGameMessage = 'The game is over';
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
    case 'declare_slam':
      if (isAfterFirstTurn(state, action)) {
        throw GameErrors.afterFirstTurn(action);
      }
      return declareSlamActionReducer(state, action);
    case 'show_trump':
      if (isAfterFirstTurn(state, action)) {
        throw GameErrors.afterFirstTurn(action);
      }
      return showTrumpActionReducer(state, action);
    case 'play_card':
      return handlePlayCardAction(state, action);
    default:
      throw GameErrors.invalidActionForGameState(action, state.name);
  }
};

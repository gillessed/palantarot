import { filter, isEqual, remove } from "lodash";
import { type Bout, type Card, isBout, TheJoker, TheOne } from "./Card";
import { cardsContain, getCardPoint } from "./CardUtils";
import {
  BidValue,
  Call,
  type CompletedTrick,
  type JokerExchangeState,
  Outcome,
  type PlayerId,
  type ShowTrumpState,
} from "./GameState";

export interface Earnings {
  pointsEarned: number;
  bouts: Bout[];
}

export const getEarnings = (
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

  let pointsEarned = cardsWon.map(getCardPoint).reduce((a, b) => a + b, 0);

  if (jokerState) {
    if (biddingTeam.indexOf(jokerState.player) > -1 !== biddingTeam.indexOf(jokerState.owed_to) > -1) {
      if (biddingTeam.indexOf(jokerState.player) > -1) {
        // joker played by bidder/partner, need to swap it back
        if (cardsWon.length > 0) {
          cardsWon.push(TheJoker);
          // trade half point card for 4.5 point card
          pointsEarned += 4;
        }
      } else {
        // joker played by opposition, need to swap it back
        if (cardsLost.length > 0) {
          remove(cardsWon, (card) => isEqual(card, TheJoker));
          // trade 4.5 point card for half point card
          pointsEarned -= 4;
        }
      }
    }
  }
  const bouts = filter(cardsWon, (card): card is Bout => isBout(card));
  const dogPoints = dog.map(getCardPoint).reduce((a, b) => a + b, 0);
  if (bid !== BidValue.ONESIXTY) {
    pointsEarned += dogPoints;
    bouts.push(...filter(dog, (card): card is Bout => isBout(card)));
  }
  return {
    pointsEarned,
    bouts,
  };
};

export const getBaseScore = (bid: BidValue, earnings: Earnings): number => {
  const neededToWin = [56, 51, 41, 36][earnings.bouts.length];
  let baseScore = bid;
  baseScore += Math.ceil(Math.abs(earnings.pointsEarned - neededToWin) / 10) * 10;
  const bidderWon = earnings.pointsEarned >= neededToWin;
  baseScore *= bidderWon ? 1 : -1;
  return baseScore;
};

export const getOutcomes = (
  players: PlayerId[],
  biddingTeam: PlayerId[],
  tricks: CompletedTrick[]
): { [player: number]: Outcome[] } => {
  const outcomes: { [player: number]: Outcome[] } = {};

  const tricks_won = tricks.filter((trick) => biddingTeam.indexOf(trick.winner) > -1).length;
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

export interface FinalScore {
  pointsEarned: number;
  bouts: Bout[];
  bidderWon: boolean;
  pointsResult: number;
}

export const getFinalScore = (
  players: PlayerId[],
  biddingTeam: PlayerId[],
  earnings: Earnings,
  baseScore: number,
  shows: ShowTrumpState,
  calls: { [player: number]: Call[] },
  outcomes: { [player: number]: Outcome[] }
): FinalScore => {
  let bidderWon = Math.sign(baseScore) > 0;
  let pointsResult = baseScore;
  for (const _player of shows) {
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

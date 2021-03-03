import { cardsWithout, getCardSuitAsNumber, getCardValueAsNumber, isBout } from "../app/play/cardUtils";
import { AllCs, AllDs, AllRs, AllVs, Card, RegValue, TrumpSuit } from "../app/play/common";
import { TrickCards } from "../app/play/ingame/playLogic";
import { InGameState } from "../app/services/ingame/InGameTypes";

// const NonPassBids = [10, 20, 40, 80, 160];
const NonPassBids = [10, 20, 40];

export function getPossibleBidValues(gameState: InGameState): number[] {
  const { state, player } = gameState;
  const maxBid = Math.max(...[...state.playerBids.values()].map((bid) => bid.bid));
  const availableBidValue: number[] = [0, ...NonPassBids.filter((value) => value > maxBid)];
  return availableBidValue;
}

export function getNonSelfCalls(gameState: InGameState): Card[] {
  const hand = gameState.state.hand;
  const hasAllRs = hand.filter(([_, value]) => value === RegValue.R).length === 4;
  const hasAllDs = hand.filter(([_, value]) => value === RegValue.D).length === 4;
  const hasAllCs = hand.filter(([_, value]) => value === RegValue.C).length === 4;
  let bidSet: Card[] = [];
  if (!hasAllRs) {
    bidSet = AllRs;
  } else if (!hasAllDs) {
    bidSet = AllDs;
  } else if (!hasAllCs) {
    bidSet = AllCs;
  } else {
    bidSet = AllVs;
  }
  const finalBidSet = cardsWithout(bidSet, ...hand);
  return finalBidSet;
}

export function lambdaMax<T>(l: (t: T) => number, ...list: T[]): T {
  if (list.length === 0) {
    throw Error('No max of empty list');
  }
  let maxT = list[0];
  let maxVal = l(list[0]);
  for (const t of list) {
    const val = l(t);
    if (val > maxVal) {
      maxVal = val;
      maxT = t;
    }
  }
  return maxT;
}


export function lambdaMin<T>(l: (t: T) => number, ...list: T[]): T {
  if (list.length === 0) {
    throw Error('No max of empty list');
  }
  let minT = list[0];
  let minVal = l(list[0]);
  for (const t of list) {
    const val = l(t);
    if (val < minVal) {
      minVal = val;
      minT = t;
    }
  }
  return minT;
}

export function dropValueSortComparator(c1: Card, c2: Card) {
  const [suit1, value1] = c1;
  const [suit2, value2] = c2;
  if (isBout(c1) && !isBout(c2)) {
    return -1;
  } else if (!isBout(c1) && isBout(c2)) {
    return 1;
  } else if (isBout(c1) && isBout(c2)) {
    return 0;
  }
  if (suit1 === TrumpSuit && suit2 !== TrumpSuit) {
    return -1;
  }
  if (suit1 !== TrumpSuit && suit2 === TrumpSuit) {
    return 1;
  }
  if (suit1 === TrumpSuit && suit2 === TrumpSuit) {
    return 0;
  }
  const v1 = getCardValueAsNumber(value1);
  const v2 = getCardValueAsNumber(value2);
  if (v1 !== v2) {
    return v2 - v1;
  }
  const s1 = getCardSuitAsNumber(suit1);
  const s2 = getCardSuitAsNumber(suit2);
  return s2 - s1;
}

export function getTrickCardList(trick: TrickCards) {
  return trick.order.map((playerId) => trick.cards.get(playerId)).filter((c) => c) as Card[];
}

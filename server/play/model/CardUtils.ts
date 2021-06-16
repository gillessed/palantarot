import _ from "lodash";
import { Card, RegSuit, RegValue, Suit, The21, TheJoker, TheOne, TrumpCard, TrumpSuit, TrumpValue } from "./Card";
import { GameErrors } from "./GameErrors";
import { PlayerId } from "./GameEvents";

/*
 * This file contains game code which is useful for both client and server.
 */

export const RegSuits = [RegSuit.Club, RegSuit.Diamond, RegSuit.Heart, RegSuit.Spade];
export const AllSuits = [...RegSuits, TrumpSuit];

export function createAllCards(): Card[] {
  const cards: Card[] = [];
  for (const suit of Object.keys(RegSuit)) {
    for (const value of Object.keys(RegValue)) {
      if (Number.parseInt(value)) { // stupid number keys...
        continue;
      }
      cards.push([
        RegSuit[suit as keyof typeof RegSuit],
        RegValue[value as keyof typeof RegValue]
      ])
    }
  }
  for (const value of Object.keys(TrumpValue)) {
    if (Number.parseInt(value)) { // stupid number keys...
      continue;
    }
    cards.push([TrumpSuit, TrumpValue[value as keyof typeof TrumpValue]])
  }
  return cards
}

export function createCardsOfSuit(suit: Suit): Card[] {
  return createAllCards().filter(([cardSuit, _]) => cardSuit === suit);
}

export function parseCard(card: string): Card {
  const suit = card[card.length - 1];
  const value = parseInt(card.slice(1, card.length - 1)) || card.slice(1, card.length - 1);
  return [suit, value] as Card;
}

export function toCardString(card: Card): string {
  return `#${card[1] === "Joker" ? "J" : card[1]}${card[0]}`
}

function invalidDeal(hands: Card[][]): boolean {
  for (const hand of hands) {
    const trumps = _.filter(hand, (card) => card[0] === TrumpSuit);
    if (trumps.length === 1 && trumps[0][1] === TrumpValue._1) {
      return true;
    }
  }
  return false;
}

export const testingSetShuffler = (new_shuffler: (cards: Card[]) => Card[] = _.shuffle) => {
  shuffler = new_shuffler
};
let shuffler: (cards: Card[]) => Card[] = _.shuffle;

export const dealCards = function (players: number): { dog: Card[], hands: { [player: number]: Card[] } } {
  const comparer = compareCards(undefined);
  while (true) {
    const cards = shuffler(createAllCards());
    const dogSize = players > 4 ? 3 : 6;
    const deal = _.chunk<Card>(cards, (cards.length - dogSize) / players);
    const dog = deal[players];
    const hands = deal.slice(0, players).map((hand) => hand.sort(comparer));
    if (invalidDeal(hands)) {
      continue; // Invalid hand, deal again!
    }
    return { dog, hands };
  }
};

export const getTrumps = function (cards?: Card[]): TrumpCard[] {
  return cards?.filter((card: Card): card is TrumpCard => card[0] == TrumpSuit) || [];
};

export const cardsEqual = function (one: Card[], two: Card[]): boolean {
  return _.isEqual(one.sort(), two.sort());
};

export const cardsContain = function (cards: Card[], target: Card): Card | undefined {
  return _.find(cards, (card) => _.isEqual(card, target))
};

export const cardsWithout = function (cards: Card[], ...subtract: Card[]): Card[] {
  return _.differenceWith(cards, subtract, _.isEqual)
};

export const getPlayerNum = function (players: PlayerId[], player: PlayerId) {
  const index = players.indexOf(player);
  if (index < 0) {
    throw GameErrors.playerNotInGame(player, players);
  } else {
    return index;
  }
};

export function getLeadCard(trick: Card[]): Card | undefined {
  for (const card of trick) {
    if (card[1] !== TrumpValue.Joker) {
      return card;
    }
  }
  return undefined;
}

export function getLeadSuit(trick: Card[]): Suit | undefined {
  const leadCard = getLeadCard(trick);
  return leadCard ? leadCard[0] : undefined;
}

function getLowestAllowableTrump(trick: Card[]): TrumpValue {
  let lowestAllowed = TrumpValue._1;
  for (const card of trick) {
    if (card[0] === TrumpSuit && card[1] !== TrumpValue.Joker && lowestAllowed < card[1]) {
      lowestAllowed = card[1]
    }
  }
  return lowestAllowed;
}

export const getCardsAllowedToPlay = function (hand: Card[], trick: Card[], anyPlayerPlayedCard: boolean, partnerSuit?: Card): Card[] {
  const leadsuit = getLeadSuit(trick);
  if (leadsuit === undefined) {
    if (!anyPlayerPlayedCard) {
      return hand.filter((card) => card[0] !== (partnerSuit ?? [])[0] || card === partnerSuit); // lead anything that isn't the partner suit or is the called card
    } else {
      return hand // new trick, lead whatever
    }
  }

  const joker = _.filter(hand, (card) => _.isEqual(card, TheJoker));
  const handInSuit = _.filter(hand, (card) => card[0] === leadsuit);
  if (leadsuit !== TrumpSuit && handInSuit.length > 0) {
    return [...handInSuit, ...joker]; // can follow non-trump suit
  }

  const lowest_allowed = getLowestAllowableTrump(trick);
  const allowedTrump = _.filter(hand, (card) =>
    card[0] === TrumpSuit && card[1] !== TrumpValue.Joker && card[1] >= lowest_allowed);
  if (allowedTrump.length > 0) {
    return [...allowedTrump, ...joker]; // can over-trump
  }
  const trump = _.filter(hand, (card) =>
    card[0] === TrumpSuit && card[1] !== TrumpValue.Joker);
  if (trump.length > 0) {
    return [...trump, ...joker]; // need to play some trump
  } else {
    return hand; // play whatever
  }
};

export function getCardSuitAsNumber(value: Suit): number {
  switch(value) {
    case TrumpSuit: return 5;
    case RegSuit.Club: return 1;
    case RegSuit.Diamond: return 2;
    case RegSuit.Heart: return 3;
    case RegSuit.Spade: return 4;
  }
}

export function getCardValueAsNumber(value: RegValue | TrumpValue): number {
  switch (value) {
    case RegValue._1:
    case RegValue._2:
    case RegValue._3:
    case RegValue._4:
    case RegValue._5:
    case RegValue._6:
    case RegValue._7:
    case RegValue._8:
    case RegValue._9:
    case RegValue._10:
      return value.valueOf();
    case RegValue.V:
      return 11;
    case RegValue.C:
      return 12;
    case RegValue.D:
      return 13;
    case RegValue.R:
      return 14;
    case TrumpValue.Joker:
      return 0;
    case TrumpValue._1:
    case TrumpValue._2:
    case TrumpValue._3:
    case TrumpValue._4:
    case TrumpValue._5:
    case TrumpValue._6:
    case TrumpValue._7:
    case TrumpValue._8:
    case TrumpValue._9:
    case TrumpValue._10:
    case TrumpValue._11:
    case TrumpValue._12:
    case TrumpValue._13:
    case TrumpValue._14:
    case TrumpValue._15:
    case TrumpValue._16:
    case TrumpValue._17:
    case TrumpValue._18:
    case TrumpValue._19:
    case TrumpValue._20:
    case TrumpValue._21:
      return value.valueOf();
    default:
      throw new Error(value);
  }
}

type Comparator<T> = (t1: T, T2: T) => number;

export const compareCards = function (lead_suit?: Suit | undefined): Comparator<Card> {
  return (left: Card, right: Card) => {
    if (_.isEqual(left, right)) {
      return 0;
    } else if (left[1] === TrumpValue.Joker) {
      return -1;
    } else if (right[1] === TrumpValue.Joker) {
      return 1;
    } else if (left[0] === right[0]) {
      return Math.sign(getCardValueAsNumber(left[1]) - getCardValueAsNumber(right[1]));
    } else if (left[0] === TrumpSuit) {
      return 1;
    } else if (right[0] === TrumpSuit) {
      return -1;
    } else if (left[0] === lead_suit) {
      return 1;
    } else if (right[0] === lead_suit) {
      return -1;
    } else {
      return left[0].charCodeAt(0) - right[0].charCodeAt(0); // at this point, whatever.
    }
  }
};

export const getCardPoint = function (card: Card) {
  if (card[0] === TrumpSuit) {
    if (card[1] === TrumpValue.Joker || card[1] === TrumpValue._1 || card[1] === TrumpValue._21) {
      return 4.5
    } else {
      return 0.5
    }
  } else {
    switch (card[1]) {
      case RegValue._1:
      case RegValue._2:
      case RegValue._3:
      case RegValue._4:
      case RegValue._5:
      case RegValue._6:
      case RegValue._7:
      case RegValue._8:
      case RegValue._9:
      case RegValue._10:
        return 0.5;
      case RegValue.V:
        return 1.5;
      case RegValue.C:
        return 2.5;
      case RegValue.D:
        return 3.5;
      case RegValue.R:
        return 4.5;
    }
  }
};

// Note: this does not include the joker slam code. If this actually happens, well, I guess we can code it afterwards.
export const getWinner = function (trick: Card[], players: PlayerId[]): [Card, PlayerId] {
  let [card, player] = [trick[0], players[0]];
  const comparer = compareCards(getLeadSuit(trick));
  for (const index in trick) {
    if (comparer(trick[index], card) > 0) {
      [card, player] = [trick[index], players[index]]
    }
  }
  return [card, player];
};

export function isBout(c: Card) {
  return _.isEqual(c, TheJoker) || _.isEqual(c, TheOne) || _.isEqual(c, The21);
}

export function getArrayRandom<T>(array: T[]): T {
  return getArrayRandoms(array, 1)[0];
}

export function getArrayRandoms<T>(array: T[], count: number): T[] {
  const dup = [...array];
  const picks: T[] = [];
  while (picks.length < count) {
    const index = Math.floor(Math.random() * dup.length);
    picks.push(dup[index]);
    dup.splice(index, 1);
  }
  return picks;
}

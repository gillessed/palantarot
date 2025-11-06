import pkg from "lodash";
import {
  type Card,
  type RegSuit,
  type RegValue,
  type Suit,
  The21,
  TheJoker,
  TheOne,
  type TrumpCard,
  type TrumpValue,
} from "./Card.ts";
import { GameErrors } from "./GameErrors.ts";
import { type PlayerId } from "./GameState.ts";

const { chunk, differenceWith, filter, find, isEqual, shuffle } = pkg;

/*
 * This file contains game code which is useful for both client and server.
 */

export const RegSuits: RegSuit[] = ["C", "D", "H", "S"];
export const AllSuits: Suit[] = [...RegSuits, "T"];

export function createAllCards(): Card[] {
  const cards: Card[] = [];
  for (const suit of RegSuits) {
    for (let i = 1; i <= 10; i++) {
      cards.push([suit, `${i}` as RegValue]);
    }
  }
  for (let i = 1; i <= 21; i++) {
    cards.push(["T", `${i}` as TrumpValue]);
  }
  cards.push(TheJoker);
  return cards;
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
  return `#${card[1] === "Joker" ? "J" : card[1]}${card[0]}`;
}

function invalidDeal(hands: Card[][]): boolean {
  for (const hand of hands) {
    const trumps = filter(hand, (card) => card[0] === "T");
    if (trumps.length === 1 && trumps[0][1] === "1") {
      return true;
    }
  }
  return false;
}

export const cardTestingSetShuffler = (new_shuffler: (cards: Card[]) => Card[] = shuffle) => {
  cardShuffler = new_shuffler;
};
let cardShuffler: (cards: Card[]) => Card[] = shuffle;

export const playerTestingSetShuffler = (new_shuffler: (players: PlayerId[]) => PlayerId[] = shuffle) => {
  playerShuffler = new_shuffler;
};
let playerShuffler: (players: PlayerId[]) => PlayerId[] = shuffle;

export interface DealtCards {
  dog: Card[];
  hands: Card[][];
}

export const shuffleDeck = (): Card[] => cardShuffler(createAllCards());
export const shufflePlayers = (players: PlayerId[]): PlayerId[] => playerShuffler(players);

export const dealCards = (players: number): DealtCards => {
  const comparer = compareCards(undefined);
  while (true) {
    const cards = cardShuffler(createAllCards());
    const dogSize = players > 4 ? 3 : 6;
    const chunkSize = (cards.length - dogSize) / players;
    const deal = chunk<Card>(cards, chunkSize);
    const dog = deal[players];
    const hands = deal.slice(0, players).map((hand) => hand.sort(comparer));
    if (invalidDeal(hands)) {
      continue; // Invalid hand, deal again!
    }
    return { dog, hands };
  }
};

export const dealRemainingCards = ({
  fixedDeal,
  players,
  allowInvalid,
}: {
  fixedDeal: DealtCards;
  players: number;
  allowInvalid?: boolean;
}): DealtCards => {
  const comparer = compareCards(undefined);
  const dealtCards: DealtCards = {
    hands: [],
    dog: [],
  };
  const currentCards: Card[] = [];
  for (let i = 0; i < players; i++) {
    dealtCards.hands.push([]);
    if (fixedDeal.hands[i]) {
      dealtCards.hands[i].push(...fixedDeal.hands[i]);
    }
    currentCards.push(...dealtCards.hands[i]);
  }

  dealtCards.dog.push(...fixedDeal.dog);
  currentCards.push(...dealtCards.dog);
  const deck = shuffleDeck();
  const cardsToDeal = cardsWithout(deck, ...currentCards);
  const dogSize = players > 4 ? 3 : 6;
  const handSize = (deck.length - dogSize) / players;
  for (let i = 0; i < players; i++) {
    const hand = dealtCards.hands[i];
    while (hand.length < handSize) {
      const nextCard = cardsToDeal.pop();
      if (!nextCard) {
        throw Error("Ran out of cards while dealing to players.");
      }
      hand.push(nextCard);
    }
    hand.sort(comparer);
  }

  while (dealtCards.dog.length < dogSize) {
    const nextCard = cardsToDeal.pop();
    if (!nextCard) {
      throw Error("Ran out of cards while dealing to the dog.");
    }
    dealtCards.dog.push(nextCard);
  }

  if (!allowInvalid && invalidDeal(dealtCards.hands)) {
    return dealRemainingCards({ fixedDeal, players, allowInvalid });
  }
  return dealtCards;
};

export const getTrumps = function (cards?: Card[]): TrumpCard[] {
  return cards?.filter((card: Card): card is TrumpCard => card[0] == "T") || [];
};

export const cardsEqual = function (one: Card[], two: Card[]): boolean {
  return isEqual(one.sort(), two.sort());
};

export const cardsContain = function (cards: Card[], target: Card): Card | undefined {
  return find(cards, (card) => isEqual(card, target));
};

export const cardsWithout = function (cards: Card[], ...subtract: Card[]): Card[] {
  return differenceWith(cards, subtract, isEqual);
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
    if (card[1] !== "Joker") {
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
  let lowestAllowed: TrumpValue = "1";
  for (const card of trick) {
    if (card[0] === "T" && card[1] !== "Joker" && lowestAllowed < card[1]) {
      lowestAllowed = card[1];
    }
  }
  return lowestAllowed;
}

export const getCardsAllowedToPlay = function (
  hand: Card[],
  trick: Card[],
  anyPlayerPlayedCard: boolean,
  partnerSuit?: Card
): Card[] {
  const leadsuit = getLeadSuit(trick);
  if (leadsuit === undefined) {
    if (!anyPlayerPlayedCard) {
      return hand.filter((card) => card[0] !== (partnerSuit ?? [])[0] || isEqual(card, partnerSuit)); // lead anything that isn't the partner suit or is the called card
    } else {
      return hand; // new trick, lead whatever
    }
  }

  const joker = filter(hand, (card) => isEqual(card, TheJoker));
  const handInSuit = filter(hand, (card) => card[0] === leadsuit);
  if (leadsuit !== "T" && handInSuit.length > 0) {
    return [...handInSuit, ...joker]; // can follow non-trump suit
  }

  const lowest_allowed = getLowestAllowableTrump(trick);
  const allowedTrump = filter(hand, (card) => card[0] === "T" && card[1] !== "Joker" && card[1] >= lowest_allowed);
  if (allowedTrump.length > 0) {
    return [...allowedTrump, ...joker]; // can over-trump
  }
  const trump = filter(hand, (card) => card[0] === "T" && card[1] !== "Joker");
  if (trump.length > 0) {
    return [...trump, ...joker]; // need to play some trump
  } else {
    return hand; // play whatever
  }
};

export function getCardSuitAsNumber(value: Suit): number {
  switch (value) {
    case "T":
      return 5;
    case "C":
      return 1;
    case "D":
      return 2;
    case "H":
      return 3;
    case "S":
      return 4;
  }
}

export function getCardValueAsNumber(value: RegValue | TrumpValue): number {
  switch (value) {
    case "1":
    case "2":
    case "3":
    case "4":
    case "5":
    case "6":
    case "7":
    case "8":
    case "9":
    case "10":
    case "11":
    case "12":
    case "13":
    case "14":
    case "15":
    case "16":
    case "17":
    case "18":
    case "19":
    case "20":
    case "21":
      return Number(value);
    case "V":
      return 11;
    case "C":
      return 12;
    case "D":
      return 13;
    case "R":
      return 14;
    case "Joker":
      return 0;
    default:
      throw new Error(value);
  }
}

type Comparator<T> = (t1: T, T2: T) => number;

export const compareCards = function (lead_suit?: Suit | undefined): Comparator<Card> {
  return (left: Card, right: Card) => {
    if (isEqual(left, right)) {
      return 0;
    } else if (left[1] === "Joker") {
      return -1;
    } else if (right[1] === "Joker") {
      return 1;
    } else if (left[0] === right[0]) {
      return Math.sign(getCardValueAsNumber(left[1]) - getCardValueAsNumber(right[1]));
    } else if (left[0] === "T") {
      return 1;
    } else if (right[0] === "T") {
      return -1;
    } else if (left[0] === lead_suit) {
      return 1;
    } else if (right[0] === lead_suit) {
      return -1;
    } else {
      return left[0].charCodeAt(0) - right[0].charCodeAt(0); // at this point, whatever.
    }
  };
};

export const getCardPoint = function (card: Card) {
  if (card[0] === "T") {
    if (card[1] === "Joker" || card[1] === "1" || card[1] === "21") {
      return 4.5;
    } else {
      return 0.5;
    }
  } else {
    switch (card[1]) {
      case "1":
      case "2":
      case "3":
      case "4":
      case "5":
      case "6":
      case "7":
      case "8":
      case "9":
      case "10":
        return 0.5;
      case "V":
        return 1.5;
      case "C":
        return 2.5;
      case "D":
        return 3.5;
      case "R":
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
      [card, player] = [trick[index], players[index]];
    }
  }
  return [card, player];
};

export function isBout(c: Card) {
  return isEqual(c, TheJoker) || isEqual(c, TheOne) || isEqual(c, The21);
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

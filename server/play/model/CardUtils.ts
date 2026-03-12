import pkg from "lodash";
import { cardsWithout } from "../../../shared/utils/cardsWithout.ts";
import {
  compareCards,
  DefaultCardComparator,
} from "../../../shared/utils/compareCards.ts";
import { createAllCards } from "../../../shared/utils/createCards.ts";
import { getLeadSuit } from "../../../shared/utils/getLeadSuit.ts";
import { isCardEqual } from "../../../shared/utils/isCardEqual.ts";
import {
  type Card,
  type RegValue,
  type Suit,
  type TrumpCard,
  type TrumpValue,
} from "./Card.ts";
import { GameErrors } from "./GameErrors.ts";
import { type PlayerId } from "./GameState.ts";
import { getCardAssetKey } from "../../../app/play/assets/ImageAssets.ts";
import { setsEqual } from "../../../shared/utils/setsEqual.ts";

const { chunk, filter, find, shuffle } = pkg;

/*
 * This file contains game code which is useful for both client and server.
 */

export function parseCard(card: string): Card {
  const suit = card[card.length - 1];
  const value =
    parseInt(card.slice(1, card.length - 1)) || card.slice(1, card.length - 1);
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

export const cardTestingSetShuffler = (
  new_shuffler: (cards: Card[]) => Card[] = shuffle,
) => {
  cardShuffler = new_shuffler;
};
let cardShuffler: (cards: Card[]) => Card[] = shuffle;

export const playerTestingSetShuffler = (
  new_shuffler: (players: PlayerId[]) => PlayerId[] = shuffle,
) => {
  playerShuffler = new_shuffler;
};
let playerShuffler: (players: PlayerId[]) => PlayerId[] = shuffle;

export interface DealtCards {
  dog: Card[];
  hands: Card[][];
}

export const shuffleDeck = (): Card[] => cardShuffler(createAllCards());
export const shufflePlayers = (players: PlayerId[]): PlayerId[] =>
  playerShuffler(players);

export const dealCards = (players: number): DealtCards => {
  while (true) {
    const cards = cardShuffler(createAllCards());
    const dogSize = players > 4 ? 3 : 6;
    const chunkSize = (cards.length - dogSize) / players;
    const deal = chunk<Card>(cards, chunkSize);
    const dog = deal[players];
    const hands = deal
      .slice(0, players)
      .map((hand) => hand.sort(DefaultCardComparator));
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
  const cardsToDeal = [...cardsWithout(deck, ...currentCards)];
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

export const getTrumps = function (cards?: readonly Card[]): TrumpCard[] {
  return cards?.filter((card: Card): card is TrumpCard => card[0] == "T") || [];
};

export const cardsEqual = function (one: Iterable<Card>, two: Iterable<Card>): boolean {
  const keysOne = new Set([...one].map(getCardAssetKey));
  const keysTwo = new Set([...two].map(getCardAssetKey));
  return setsEqual(keysOne, keysTwo);
};

export const cardsContain = function (
  cards: readonly Card[],
  target: Card,
): Card | undefined {
  return find(cards, (card) => isCardEqual(card, target));
};

export const getPlayerNum = function (players: PlayerId[], player: PlayerId) {
  const index = players.indexOf(player);
  if (index < 0) {
    throw GameErrors.playerNotInGame(player, players);
  } else {
    return index;
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
export const getWinner = function (
  trick: Card[],
  players: PlayerId[],
): [Card, PlayerId] {
  let [card, player] = [trick[0], players[0]];
  const comparer = compareCards(getLeadSuit(trick));
  for (const index in trick) {
    if (comparer(trick[index], card) > 0) {
      [card, player] = [trick[index], players[index]];
    }
  }
  return [card, player];
};

export function getArrayRandom<T>(array: readonly T[]): T {
  return getArrayRandoms(array, 1)[0];
}

export function getArrayRandoms<T>(array: readonly T[], count: number): T[] {
  const dup = [...array];
  const picks: T[] = [];
  while (picks.length < count) {
    const index = Math.floor(Math.random() * dup.length);
    picks.push(dup[index]);
    dup.splice(index, 1);
  }
  return picks;
}

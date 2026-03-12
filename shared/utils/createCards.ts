import { Card, RegValues, Suit, TrumpValues } from "../../server/play/model/Card";
import { RegSuits } from "./CardSuits";

export function createAllCards(): Card[] {
  const cards: Card[] = [];
  for (const suit of RegSuits) {
    for (const value of RegValues) {
      cards.push([suit, value]);
    }
  }
  for (const trumpValue of TrumpValues) {
    cards.push(["T", trumpValue]);
  }
  return cards;
}

export function createCardsOfSuit(suit: Suit): Card[] {
  return createAllCards().filter(([cardSuit, _]) => cardSuit === suit);
}
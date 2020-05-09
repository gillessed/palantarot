import {Card, RegSuit, Suit, TrumpSuit} from "../common";
import React from "react";

const suitEmoji = new Map<Suit, string>([
  [RegSuit.Spade, "♠"],
  [RegSuit.Heart, "♥"],
  [RegSuit.Club, "♣"],
  [RegSuit.Diamond, "♦"],
  [TrumpSuit, "★"],
]);

const suitClass = new Map<Suit, string>([
  [RegSuit.Spade, "spade-suit"],
  [RegSuit.Heart, "heart-suit"],
  [RegSuit.Club, "club-suit"],
  [RegSuit.Diamond, "diamond-suit"],
  [TrumpSuit, "trump-suit"],
]);

export function renderCards(...cards: Card[]) {
  return cards.map((card, i) => (
    <span key={i} className={"card " + suitClass.get(card[0])} >
      {card[1] === "Joker" ? "J" : card[1]}{suitEmoji.get(card[0])}
    </span>
  ));
}

export function parseCard(card: string) {
  const suit = card[0];
  const value = parseInt(card.slice(1)) || card.slice(1);
  return [suit, value] as Card;
}

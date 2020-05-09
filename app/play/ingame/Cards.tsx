import {Card, RegSuit, Suit, TrumpSuit} from "../common";
import React from "react";
import _ from "lodash";

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

export function parseCard(card: string): Card {
  const suit = card[card.length-1];
  const value = parseInt(card.slice(1, card.length-1)) || card.slice(1, card.length-1);
  return [suit, value] as Card;
}

const cardPattern = /#[0-9JVCDR]{1,2}[SHDCT]/g;
export function renderCardsText(text: string): (string | JSX.Element)[] {
  const normal_bits = text.split(cardPattern) || [];
  const card_bits = renderCards(...text.match(cardPattern)?.map(parseCard) || []);
  return _.flatMap(normal_bits, (element, i) => [element, card_bits[i]]);
}

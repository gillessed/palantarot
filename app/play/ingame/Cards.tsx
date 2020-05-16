import {Card, RegSuit, Suit, TrumpSuit} from "../common";
import React from "react";
import _ from "lodash";
import {cardsContain, cardsWithout} from "../cardUtils";

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

function toCardKey(card: Card) {
  return card.join("");
}

export function parseCard(card: string): Card {
  const suit = card[card.length-1];
  const value = parseInt(card.slice(1, card.length-1)) || card.slice(1, card.length-1);
  return [suit, value] as Card;
}

export function toCardString(card: Card): string {
  return `#${card[1] === "Joker" ? "J" : card[1]}${card[0]}`
}

interface CardProps {
  card: Card
  selected?: boolean
  onClick?(card: Card): void
}

export class CardComponent extends React.PureComponent<CardProps> {
  public render() {
    const card = this.props.card;
    const className = [
      "card",
      suitClass.get(card[0]),
      this.props.selected ? "card-selected" : "",
      this.props.onClick ? "card-selectable" : "",
    ].join(" ");
    return (
      <span className={className} onClick={this.onClick} title={toCardString(card)}>
        {card[1] === "Joker" ? "J" : card[1]}{suitEmoji.get(card[0])}
      </span>
    )
  }

  private onClick = () => {
    if (this.props.onClick) {
      this.props.onClick(this.props.card);
    }
  }
}

export function renderCards(...cards: Card[]) {
  return cards.map((card: Card) => <CardComponent key={toCardKey(card)} card={card} />);
}

export const cardPattern = /#[0-9JVCDR]{1,2}[SHDCT]/g;
export function renderCardsText(text: string): (string | JSX.Element)[] {
  const normal_bits = text.split(cardPattern) || [];
  const card_bits = renderCards(...text.match(cardPattern)?.map(parseCard) || []);
  return _.flatMap(normal_bits, (element, i) => [element, card_bits[i]]);
}

interface SelectableCardsProps {
  cards: Card[]
  selected: Card[]
  onChange(cards: Card[]): void
}

export class SelectableCards extends React.PureComponent<SelectableCardsProps> {
  public render() {
    const set = new Set<Card>(this.props.selected);
    return this.props.cards.map((card: Card) =>
      <CardComponent key={toCardKey(card)}
                     card={card}
                     selected={set.has(card)}
                     onClick={this.changeSelected} />
    );
  }

  private changeSelected = (card: Card) => {
    const selected = cardsContain(this.props.selected, card)
      ? cardsWithout(this.props.selected, card)
      : [...this.props.selected, card];
    this.props.onChange(selected);
  }
}
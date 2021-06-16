import _ from "lodash";
import { Card, Suit, TrumpValue } from "../server/play/model/Card";
import { getCardValueAsNumber } from "../server/play/model/CardUtils";

export class CardList {
  private list: Card[];
  constructor(...cards: Card[]) {
    this.list = [...cards];
  }

  public add = (...cards: Card[]) => {
    this.list.push(...cards);
  }

  private removeInternal = (card: Card) => {
    const index = this.list.findIndex((c) => _.isEqual(c, card));
    this.list.splice(index, 1);
  }

  public remove = (...cards: Card[]) => {
    cards.forEach(this.removeInternal);
  }

  public has = (card: Card): boolean => {
    return !!this.list.find((c) => _.isEqual(c, card));
  }

  public get = (index: number): Card => {
    return this.list[index];
  }

  public sort(comparator: (c1: Card, c2: Card) => number) {
    this.list.sort(comparator);
  }

  public getLowest = (suit: Suit): Card | null => {
    let minNum = 30;
    let minCard = null;
    for (const card of this.list) {
      const [cardSuit, cardValue] = card;
      if (cardValue !== TrumpValue.Joker && cardSuit === suit) {
        const num = getCardValueAsNumber(cardValue);
        if (num < minNum) {
          minNum = num;
          minCard = card;
        }
      }
    }
    return minCard;
  }

  public suitFilter = (suit: Suit): CardList => {
    const cards = this.list.filter(([cardSuit, _]) => cardSuit === suit);
    return new CardList(...cards);
  }

  public size = () => {
    return this.list.length;
  }

  public [Symbol.iterator]() {
    return this.list[Symbol.iterator]();
  }
}

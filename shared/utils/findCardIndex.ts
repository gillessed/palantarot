import { Card } from "../../server/play/model/Card";
import { compareCards } from "./compareCards";

export const findCardIndex = (cards: readonly Card[], card: Card) => {
  let index = 0;
  while (index < cards.length) {
    if (compareCards()(cards[index], card) < 0) {
      return index;
    }
    index++;
  }
  return index;
}
import { Card } from "../../server/play/model/Card";
import { DefaultCardComparator } from "./compareCards";

export const findCardInsertIndex = (cards: readonly Card[], card: Card) => {
  let index = 0;
  while (index < cards.length) {
    if (DefaultCardComparator(cards[index], card) > 0) {
      return index;
    }
    index++;
  }
  return index;
};

import { isEqual } from "lodash";
import { Card } from "../../server/play/model/Card";

export const indexOfCard = (cards: readonly Card[], card: Card): number => {
  for (let index = 0; index < cards.length; index++) {
    if (isEqual(cards[index], card)) {
      return index;
    }
  }
  return -1;
};

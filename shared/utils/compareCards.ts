import type { Card, Suit } from "../../server/play/model/Card";
import { getCardValueAsNumber } from "./getCardValueAsNumber";
import { isCardEqual } from "./isCardEqual";

type Comparator<T> = (t1: T, T2: T) => number;

export const compareCards = function (
  lead_suit?: Suit | undefined
): Comparator<Card> {
  return (left: Card, right: Card) => {
    if (isCardEqual(left, right)) {
      return 0;
    } else if (left[1] === "Joker") {
      return -1;
    } else if (right[1] === "Joker") {
      return 1;
    } else if (left[0] === right[0]) {
      return Math.sign(
        getCardValueAsNumber(left[1]) - getCardValueAsNumber(right[1])
      );
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

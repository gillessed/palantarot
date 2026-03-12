import { Card } from "../../server/play/model/Card";
import { indexOfCard } from "./indexOfCard";

export function cardsWithout(
  cards: readonly Card[],
  ...subtract: readonly Card[]
): readonly Card[] {
  const newCards = [...cards];
  for (const card of subtract) {
    const index = indexOfCard(newCards, card);
    if (index >= 0) {
      newCards.splice(index, 1);
    }
  }
  return newCards;
}

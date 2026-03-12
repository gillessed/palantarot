import { Card } from "../../server/play/model/Card";
import { ClientTrick } from "../types/ClientGameTypes";

export function getTrickCards(trick: ClientTrick): readonly Card[] {
  const cards: Card[] = [];
  for (const playerId of trick.order) {
    const card = trick.cards.get(playerId);
    if (card != null) {
      cards.push(card);
    }
  }
  return cards;
}

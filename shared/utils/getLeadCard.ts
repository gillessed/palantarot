import { Card } from "../../server/play/model/Card";

export function getLeadCard(trick: readonly Card[]): Card | undefined {
  for (const card of trick) {
    if (card[1] !== "Joker") {
      return card;
    }
  }
  return undefined;
}

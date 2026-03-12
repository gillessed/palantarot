import { Card, TrumpValue } from "../../server/play/model/Card";

export function getLowestAllowableTrump(trick: readonly Card[]): TrumpValue {
  let lowestAllowed: TrumpValue = "1";
  for (const card of trick) {
    if (card[0] === "T" && card[1] !== "Joker" && lowestAllowed < card[1]) {
      lowestAllowed = card[1];
    }
  }
  return lowestAllowed;
}

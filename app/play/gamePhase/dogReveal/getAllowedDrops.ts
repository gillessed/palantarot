import { Card, isBout } from "../../../../server/play/model/Card";

export function getAllowedDrops (hand: readonly Card[], dogSize: number): readonly Card[] {
  const nonTrumpNonKings = hand.filter(([suit, value]) => suit !== "T" && value !== "R");
  if (nonTrumpNonKings.length >= dogSize) {
    return nonTrumpNonKings;
  }
  const nonBoutNonKings = hand.filter((card) => card[0] !== "T" && !isBout(card));
  return nonBoutNonKings;
}
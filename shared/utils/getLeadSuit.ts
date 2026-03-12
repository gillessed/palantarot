import { Card, Suit } from "../../server/play/model/Card";
import { getLeadCard } from "./getLeadCard";

export function getLeadSuit(trick: readonly Card[]): Suit | undefined {
  const leadCard = getLeadCard(trick);
  return leadCard ? leadCard[0] : undefined;
}

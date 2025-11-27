import { Card } from "../../../../server/play/model/Card";

export function getAllowedPartnerCalls(
  hand: ReadonlyArray<Card>,
  allowAll: boolean
) {
  const counts = new Map<string, number>();
  for (const card of hand) {
    const [_, valueEnum] = card;
    const value = `${valueEnum}`;
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  const canPickD = counts.get("R") === 4 || allowAll;
  const canPickC = (canPickD && counts.get("D") === 4) || allowAll;
  const canPickV = (canPickC && counts.get("C") === 4) || allowAll;
  return [true, canPickD, canPickC, canPickV];
}

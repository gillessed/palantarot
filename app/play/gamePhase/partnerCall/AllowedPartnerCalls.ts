import { getValueCounts } from "../../../../shared/game/ClientGameSelectors";
import type { ClientGameState } from "../../../../shared/types/ClientGameState";

export function getAllowedPartnerCalls(
  game: ClientGameState,
  allowAll: boolean
) {
  const counts = getValueCounts(game);
  const canPickD = counts.get("R") === 4 || allowAll;
  const canPickC = (canPickD && counts.get("D") === 4) || allowAll;
  const canPickV = (canPickC && counts.get("C") === 4) || allowAll;
  return {
    canPickD,
    canPickC,
    canPickV,
  };
}

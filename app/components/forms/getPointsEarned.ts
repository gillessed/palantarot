import type { PlayerRole } from "./PlayerRoles.ts";

export function getPointsEarned(
  basePoints: number,
  playerRole: PlayerRole,
  numberOfPlayers: number,
  bidderCalledSelf: boolean
) {
  if (playerRole === "bidder") {
    if (numberOfPlayers === 3) {
      return basePoints * 2;
    } else if (numberOfPlayers === 4) {
      return basePoints * 3;
    } else {
      if (bidderCalledSelf) {
        return basePoints * 4;
      } else {
        return basePoints * 2;
      }
    }
  } else if (playerRole === "partner") {
    return basePoints;
  } else {
    return -basePoints;
  }
}

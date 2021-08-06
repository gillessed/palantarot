import {PlayerRoles} from './PlayerRoles';

export function getPointsEarned(
  basePoints: number,
  playerRole: string,
  numberOfPlayers: number,
  bidderCalledSelf: boolean
) {
  if (playerRole === PlayerRoles.BIDDER) {
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
  } else if (playerRole === PlayerRoles.PARTNER) {
    return basePoints;
  } else {
    return -basePoints;
  }
}

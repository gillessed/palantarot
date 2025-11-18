import { Player } from "../../../server/model/Player";

export function getPlayerName(player?: Player) {
  return player != null
    ? `${player.firstName} ${player.lastName}`
    : "Unknown Player";
}

export function getPlayerDebugName(player?: Player) {
  return player != null
    ? `${player.firstName}_${player.lastName}`.toLocaleLowerCase()
    : undefined;
}

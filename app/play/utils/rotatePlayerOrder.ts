import { PlayerId } from "../../../server/play/model/GameState";

export function rotatePlayerOrder(
  playerOrder: readonly PlayerId[],
  playerId: string,
) {
  const playerIndex = playerOrder.indexOf(playerId);
  if (playerIndex <= 0) {
    return [...playerOrder];
  } else {
    return [
      ...playerOrder.slice(playerIndex),
      ...playerOrder.slice(0, playerIndex),
    ];
  }
}

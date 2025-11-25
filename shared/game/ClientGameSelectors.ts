import type { ClientGameState } from "../types/ClientGameState";

// Count the number of cards of each value.
export const getValueCounts = (game: ClientGameState) => {
  const counts = new Map<string, number>();
  if (game.phase === "new_game") {
    return counts;
  }
  for (const card of game.hand) {
    const [_, valueEnum] = card;
    const value = `${valueEnum}`;
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return counts;
};

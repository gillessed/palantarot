import { useMemo } from "react";
import { Player } from "../../../server/model/Player";
import type { PlayerId } from "../../../server/play/model/GameState";

export function useBotPlayers(players: Map<PlayerId, Player>): Player[] {
  return useMemo(() => {
    const bots: Player[] = [];
    for (const playerId of players.keys()) {
      const player = players.get(playerId);
      if (player != null && player?.isBot) {
        bots.push(player);
      }
    }
    return bots;
  }, [players]);
}

import { useMemo } from "react";
import { Player } from "../../server/model/Player";
import { PlayerId } from "../../server/play/model/GameState";

export function usePlayersList(players: Map<PlayerId, Player>) {
  return useMemo(() => {
    const list = Array.from(players.values());
    return list.sort((p1: Player, p2: Player) => {
      const n1 = `${p1.firstName}${p1.lastName}`;
      const n2 = `${p2.firstName}${p2.lastName}`;
      return n1.localeCompare(n2);
    });
  }, [players]);
}

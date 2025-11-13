import type { LineChartSeries } from "@mantine/charts";
import type { GameRecord, PlayerHand } from "../../../server/model/GameRecord";
import type { Player } from "../../../server/model/Player";
import type { PlayerId } from "../../../server/play/model/GameState";
import { getPlayerName } from "../../services/utils/playerName";
import { Colors } from "../../utils/Colors";
import { useMemo } from "react";

function getPlayersForGame(game: GameRecord) {
  const playerIds = new Set<PlayerId>();
  playerIds.add(game.bidderId);
  if (game.partnerId != null) {
    playerIds.add(game.partnerId);
  }
  for (const hand of game.handData.opposition) {
    playerIds.add(hand.id);
  }
  return playerIds;
}

export function usePointData(
  players: Map<PlayerId, Player>,
  games: GameRecord[],
  playerFilter?: (playerId: PlayerId) => boolean
) {
  return useMemo(() => {
    const playerNames = new Set<string>();
    for (const game of games) {
      for (const playerId of getPlayersForGame(game)) {
        if (playerFilter?.(playerId) ?? true)
          playerNames.add(getPlayerName(players.get(playerId)));
      }
    }
    const initialEntry: Record<string, any> = {
      game: 0,
    };
    for (const playerName of playerNames) {
      initialEntry[playerName] = 0;
    }
    const data: Record<string, any>[] = [initialEntry];
    let currentEntry = initialEntry;

    for (const { handData } of games) {
      let filterGame = true;
      const newEntry: Record<string, any> = {
        ...currentEntry,
        game: currentEntry.game + 1,
      };
      function setData(hand: PlayerHand) {
        if (playerFilter?.(hand.id) ?? true) {
          filterGame = false;
          const handPlayer = getPlayerName(players.get(hand.id));
          newEntry[handPlayer] = currentEntry[handPlayer] + hand.pointsEarned;
        }
      }
      setData(handData.bidder);
      if (handData.partner) {
        setData(handData.partner);
      }
      for (const hand of handData.opposition) {
        setData(hand);
      }
      if (!filterGame) {
        data.push(newEntry);
        currentEntry = newEntry;
      }
    }
    let colorIndex = 0;
    const series: LineChartSeries[] = [];
    for (const playerName of playerNames) {
      series.push({
        name: playerName,
        color: Colors[colorIndex],
      });
      colorIndex = (colorIndex + 1) % Colors.length;
    }
    return { data, series };
  }, [players, games, playerFilter]);
}

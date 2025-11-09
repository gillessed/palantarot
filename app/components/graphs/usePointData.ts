import type { LineChartSeries, ScatterChartSeries } from "@mantine/charts";
import type { GameRecord, PlayerHand } from "../../../server/model/GameRecord";
import type { Month } from "../../../server/model/Month";
import type { Player } from "../../../server/model/Player";
import type { PlayerId } from "../../../server/play/model/GameState";
import { getPlayerName } from "../../services/players/playerName";
import { Colors } from "../../utils/Colors";
import { getStartOfMonth } from "./timeUtils";

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

export function usePointData(players: Map<PlayerId, Player>, games: GameRecord[]) {
  const playerNames = new Set<string>();
  for (const game of games) {
    for (const playerId of getPlayersForGame(game)) {
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
    const newEntry: Record<string, any> = { ...currentEntry, game: currentEntry.game + 1 };
    function setData(hand: PlayerHand) {
      const handPlayer = getPlayerName(players.get(hand.id));
      newEntry[handPlayer] = currentEntry[handPlayer] + hand.pointsEarned;
    }
    setData(handData.bidder);
    if (handData.partner) {
      setData(handData.partner);
    }
    for (const hand of handData.opposition) {
      setData(hand);
    }
    data.push(newEntry);
    currentEntry = newEntry;
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
}

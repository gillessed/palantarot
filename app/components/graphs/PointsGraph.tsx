import { LineChart } from "@mantine/charts";
import { Center } from "@mantine/core";
import { memo } from "react";
import { GameRecord } from "../../../server/model/GameRecord";
import { Player } from "../../../server/model/Player";
import { PlayerId } from "../../../server/play/model/GameState";
import { usePointData } from "./usePointData";

interface Props {
  players: Map<PlayerId, Player>;
  games: GameRecord[];
  playerFilter?: (playerId: PlayerId) => boolean;
  withLegend?: boolean;
}

export const PointsGraph = memo(function PointsGraph({
  players,
  games,
  playerFilter,
  withLegend,
}: Props) {
  const { data, series } = usePointData(players, games, playerFilter);

  return (
    <LineChart
      h={500}
      data={data}
      dataKey="game"
      series={series}
      withLegend={withLegend}
      curveType="bump"
      dotProps={{ r: 6, strokeWidth: 2, stroke: "#fff" }}
      activeDotProps={{ r: 8, strokeWidth: 1, fill: "#fff" }}
      legendProps={{ verticalAlign: "bottom", height: 50 }}
      gridAxis="xy"
    />
  );
});

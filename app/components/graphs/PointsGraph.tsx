import { LineChart } from "@mantine/charts";
import { Center } from "@mantine/core";
import { memo } from "react";
import { GameRecord } from "../../../server/model/GameRecord";
import { Player } from "../../../server/model/Player";
import { Result } from "../../../server/model/Result";
import { PlayerId } from "../../../server/play/model/GameState";
import { usePointData } from "./usePointData";

interface Props {
  players: Map<PlayerId, Player>;
  games: GameRecord[];
}

export const PointsGraph = memo(function PointsGraph({ players, games }: Props) {
  const { data, series } = usePointData(players, games);

  return (
    <Center>
      <LineChart
        h={500}
        data={data}
        dataKey="game"
        series={series}
        withLegend
        curveType="bump"
        dotProps={{ r: 6, strokeWidth: 2, stroke: "#fff" }}
        activeDotProps={{ r: 8, strokeWidth: 1, fill: "#fff" }}
        legendProps={{ verticalAlign: "bottom", height: 50 }}
      />
    </Center>
  );
});

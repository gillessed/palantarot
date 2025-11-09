import { memo, useMemo } from "react";
import { PlayerId } from "../../../server/play/model/GameState";
import { Player } from "../../../server/model/Player";
import { Result } from "../../../server/model/Result";
import { GameRecord } from "../../../server/model/GameRecord";
import { LineChart } from "@mantine/charts";
import moment from "moment";
import { IMonth, Month } from "../../../server/model/Month";
import { PlayerResult, Timeseries } from ".";

interface Props {
  players: Map<PlayerId, Player>;
  results: Result[];
  games: GameRecord[];
  month: Month;
}

export const PointsGraph = memo(function PointsGraph({
  players,
  results,
  games,
  month,
}: Props) {
  const range = useMemo(() => {
    const rangeStartString = moment()
      .year(month.year)
      .month(month.month)
      .date(1)
      .hour(0)
      .minute(0)
      .second(0)
      .format("YYYY-MM-DDTHH:mm:ss");
    const rangeStart = new Date(rangeStartString);
    let rangeEndString: string;
    if (IMonth.now().is(month)) {
      rangeEndString = moment(games[games.length - 1].timestamp)
        .add(1, "days")
        .hour(0)
        .minute(0)
        .second(0)
        .format("YYYY-MM-DDTHH:mm:ss");
    } else {
      rangeEndString = moment(rangeStart)
        .add(1, "month")
        .format("YYYY-MM-DDTHH:mm:ss");
    }
    const rangeEnd = new Date(rangeEndString);
    const range: [Date, Date] = [rangeStart, rangeEnd];
    return range;
  }, [players, results, games, month]);

  return (
    <LineChart
      h={300}
      data={data}
      dataKey="date"
      series={[
        { name: "Apples", color: "indigo.6" },
        { name: "Oranges", color: "blue.6" },
        { name: "Tomatoes", color: "teal.6" },
      ]}
      curveType="linear"
      withDots={false}
    />
  );
});

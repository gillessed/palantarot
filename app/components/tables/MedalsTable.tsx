import { Table, Text } from "@mantine/core";
import { memo, useMemo } from "react";
import { Player } from "../../../server/model/Player";
import { MonthlyScore, Records } from "../../../server/model/Records";
import { PlayerId } from "../../../server/play/model/GameState";
import { integerComparator } from "../../../server/utils";
import { Aggregate, Aggregator, count } from "../../../server/utils/count";
import { useGroupedMonthlyScores } from "../../services/selectors/useGroupedMonthlyScores";
import { MedalRecord, MedalsTableCell } from "./MedalsTableCell";

interface MedalEntry {
  id: string;
  rank: number;
}

interface Props {
  players: Map<PlayerId, Player>;
  records: Records;
}

export const MedalsTable = memo(function MedalsTable({
  players,
  records,
}: Props) {
  const groupedMonthlyScores = useGroupedMonthlyScores(records);

  const monthlyMedals: MedalRecord[] = useMemo(() => {
    const firsts: MedalEntry[] = [];
    const seconds: MedalEntry[] = [];
    const thirds: MedalEntry[] = [];
    groupedMonthlyScores.forEach((monthlyScores: MonthlyScore[]) => {
      firsts.push({
        id: monthlyScores[0].playerId,
        rank: 0,
      });
      seconds.push({
        id: monthlyScores[1].playerId,
        rank: 1,
      });
      thirds.push({
        id: monthlyScores[2].playerId,
        rank: 2,
      });
    });
    const medals = [...firsts, ...seconds, ...thirds];
    const firstsAggregator: Aggregator<MedalEntry, boolean, number> = {
      name: "firsts",
      initialValue: 0,
      extractor: (medal: MedalEntry) => medal.rank === 0,
      aggretator: (aggregate: number, rank: boolean) =>
        rank ? aggregate + 1 : aggregate,
    };
    const secondsAggregator: Aggregator<MedalEntry, boolean, number> = {
      name: "seconds",
      initialValue: 0,
      extractor: (medal: MedalEntry) => medal.rank === 1,
      aggretator: (aggregate: number, rank: boolean) =>
        rank ? aggregate + 1 : aggregate,
    };
    const thirdsAggregator: Aggregator<MedalEntry, boolean, number> = {
      name: "thirds",
      initialValue: 0,
      extractor: (medal: MedalEntry) => medal.rank === 2,
      aggretator: (aggregate: number, rank: boolean) =>
        rank ? aggregate + 1 : aggregate,
    };
    const medalRecords = count<MedalEntry>(
      medals,
      (medal: MedalEntry) => medal.id,
      [firstsAggregator, secondsAggregator, thirdsAggregator]
    ).map((aggregate: Aggregate) => {
      return {
        id: aggregate.id,
        firsts: aggregate.values[firstsAggregator.name],
        seconds: aggregate.values[secondsAggregator.name],
        thirds: aggregate.values[thirdsAggregator.name],
      };
    });
    medalRecords.sort(
      integerComparator(
        (medalRecord: MedalRecord) => medalRecord.firsts,
        "desc",
        integerComparator(
          (medalRecord: MedalRecord) => medalRecord.seconds,
          "desc",
          integerComparator(
            (medalRecord: MedalRecord) => medalRecord.thirds,
            "desc"
          )
        )
      )
    );
    return medalRecords;
  }, [groupedMonthlyScores]);

  if (monthlyMedals.length === 0) {
    return <Text>No medals yet</Text>;
  }

  return (
    <Table withTableBorder>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Player</Table.Th>
          <Table.Th>Medals</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {monthlyMedals.map((medalRecord) => {
          return (
            <MedalsTableCell medalRecord={medalRecord} players={players} />
          );
        })}
      </Table.Tbody>
    </Table>
  );
});

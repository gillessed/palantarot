import { Table, Text } from "@mantine/core";
import { memo, useMemo } from "react";
import { IMonth } from "../../../server/model/Month";
import { Player } from "../../../server/model/Player";
import { MonthlyScore, Records } from "../../../server/model/Records";
import { PlayerId } from "../../../server/play/model/GameState";
import { integerComparator } from "../../../server/utils";
import { Aggregate, Aggregator, count } from "../../../server/utils/count";
import { MonthWinnersTableCell } from "./MonthWinnersTableCell";
import { useGroupedMonthlyScores } from "../../services/selectors/useGroupedMonthlyScores";

interface MonthWinners {
  month: IMonth;
  first?: MonthlyScore;
  second?: MonthlyScore;
  third?: MonthlyScore;
}

interface Props {
  playerId?: PlayerId;
  players: Map<string, Player>;
  records: Records;
}

export const MonthWinnersTable = memo(function MonthWinnersTable({
  players,
  records,
  playerId,
}: Props) {
  const groupedMonthlyScores = useGroupedMonthlyScores(records);

  const eachMonthWinners: MonthWinners[] = useMemo(() => {
    const unsortedScores = groupedMonthlyScores
      .map((monthScores: MonthlyScore[]) => {
        return {
          month: IMonth.n(monthScores[0].month, monthScores[0].year),
          first: monthScores[0],
          second: monthScores[1],
          third: monthScores[2],
        };
      })
      .filter((winners) => {
        if (playerId == null) {
          return true;
        } else {
          return (
            winners.first.playerId === playerId ||
            winners.second.playerId === playerId ||
            winners.third.playerId === playerId
          );
        }
      });
    return unsortedScores.sort(
      IMonth.comparator(
        (monthWinners: MonthWinners) => monthWinners.month,
        "desc"
      )
    );
  }, [groupedMonthlyScores]);

  if (eachMonthWinners.length === 0) {
    return <Text> No wins yet </Text>;
  }

  return (
    <Table withTableBorder>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>MonTable.Th</Table.Th>
          <Table.Th>First</Table.Th>
          <Table.Th>Second</Table.Th>
          <Table.Th>Table.Third</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <tbody>
        {eachMonthWinners.map((monthWinners: MonthWinners) => {
          return (
            <Table.Tr key={IMonth.toString(monthWinners.month)}>
              <Table.Td>{monthWinners.month.getHumanReadableString()}</Table.Td>
              <MonthWinnersTableCell
                players={players}
                playerId={playerId}
                score={monthWinners.first}
              />
              <MonthWinnersTableCell
                players={players}
                playerId={playerId}
                score={monthWinners.second}
              />
              <MonthWinnersTableCell
                players={players}
                playerId={playerId}
                score={monthWinners.third}
              />
            </Table.Tr>
          );
        })}
      </tbody>
    </Table>
  );
});

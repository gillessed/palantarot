import { Table } from "@mantine/core";
import { memo } from "react";
import { Player } from "../../../server/model/Player";
import { RoleResultRankChange } from "../../../server/model/Result";
import { ResultRow } from "./ResultRow";

interface Props {
  players: Map<string, Player>;
  results: RoleResultRankChange[];
  renderDelta?: boolean;
  renderRankDelta?: boolean;
}

export const ScoreTable = memo(function ScoreTable({
  players,
  results,
  renderDelta,
  renderRankDelta,
}: Props) {
  return (
    <Table withTableBorder highlightOnHover>
      <Table.Thead>
        <Table.Tr>
          <Table.Th></Table.Th>
          <Table.Th>Player</Table.Th>
          <Table.Th>Total Score</Table.Th>
          <Table.Th>#</Table.Th>
          <Table.Th>Avg</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {results.map((result, index) => {
          return (
            <ResultRow
              key={index}
              index={index}
              players={players}
              result={result}
              renderDelta={renderDelta}
              renderRankDelta={renderRankDelta}
            />
          );
        })}
      </Table.Tbody>
    </Table>
  );
});

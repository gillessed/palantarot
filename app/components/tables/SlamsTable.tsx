import { Table } from "@mantine/core";
import { memo } from "react";

export interface SlamRecord {
  playerName: string;
  count: number;
}

interface Props {
  records: SlamRecord[];
}

export const SlamsTable = memo(function SlamsTable({ records }: Props) {
  return (
    <Table className="slam-count-table" withTableBorder>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Player</Table.Th>
          <Table.Th># of Slams</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {records.map(({ count, playerName }) => {
          return (
            <Table.Tr key={playerName}>
              <Table.Td>{playerName}</Table.Td>
              <Table.Td>{count}</Table.Td>
            </Table.Tr>
          );
        })}
      </Table.Tbody>
    </Table>
  );
});

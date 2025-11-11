import { Table } from "@mantine/core";
import { memo } from "react";
import { Delta } from "../../../server/model/Delta";
import { DeltaIcon } from "../DeltaIcon";
import { getPlayerName } from "../../services/players/playerName";
import { PlayerId } from "../../../server/play/model/GameState";
import { Player } from "../../../server/model/Player";

interface Props {
  players: Map<PlayerId, Player>;
  title: string;
  deltas: Delta[];
}

export const DeltasTable = memo(function DeltasTable({
  deltas,
  title,
  players,
}: Props) {
  return (
    <Table withTableBorder>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Player</Table.Th>
          <Table.Th>{title}</Table.Th>
          <Table.Th>Date</Table.Th>
          <Table.Th>Games Played</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {deltas.map((delta, index) => {
          const player = players.get(delta.playerId);
          const playerName = getPlayerName(player);
          return (
            <Table.Tr key={index}>
              <Table.Td>{playerName}</Table.Td>
              <Table.Td>
                <DeltaIcon delta={delta.delta} />
              </Table.Td>
              <Table.Td>{delta.date}</Table.Td>
              <Table.Td>{delta.gameCount}</Table.Td>
            </Table.Tr>
          );
        })}
      </Table.Tbody>
    </Table>
  );
});

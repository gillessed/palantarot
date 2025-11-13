import { memo } from "react";
import { Player } from "../../../server/model/Player";
import { Streak } from "../../../server/model/Streak";
import { DynamicRoutes } from "../../../shared/routes";
import { Link } from "react-router";
import { getPlayerName } from "../../services/utils/playerName";
import { Table } from "@mantine/core";

interface Props {
  players: Map<string, Player>;
  streaks: Streak[];
}

export const StreaksTable = memo(function StreaksTable({
  players,
  streaks,
}: Props) {
  return (
    <Table withTableBorder>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Player</Table.Th>
          <Table.Th>Streak</Table.Th>
          <Table.Th>Last Game ID</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <tbody>
        {streaks.map((streak) => {
          return (
            <Table.Tr key={streak.playerId}>
              <Table.Td>
                <Link to={DynamicRoutes.player(streak.playerId)}>
                  {getPlayerName(players.get(streak.playerId))}
                </Link>
              </Table.Td>
              <Table.Td>{streak.gameCount}</Table.Td>
              <Table.Td>
                <Link to={DynamicRoutes.game(streak.lastGameId)}>
                  {streak.lastGameId}
                </Link>
              </Table.Td>
            </Table.Tr>
          );
        })}
      </tbody>
    </Table>
  );
});

import { Group, Table, Text } from "@mantine/core";
import { memo, useCallback } from "react";
import { useNavigate } from "react-router";
import { Player } from "../../../server/model/Player";
import { RoleResultRankChange } from "../../../server/model/Result";
import { PlayerId } from "../../../server/play/model/GameState";
import { DynamicRoutes } from "../../../shared/routes";
import { getPlayerName } from "../../services/utils/playerName";
import { DeltaIcon } from "../DeltaIcon";

interface Props {
  players: Map<PlayerId, Player>;
  result: RoleResultRankChange;
  index: number;
  renderRankDelta?: boolean;
  renderDelta?: boolean;
}

export const ResultRow = memo(function ResultRow({
  result,
  index,
  players,
  renderRankDelta,
  renderDelta,
}: Props) {
  const navigate = useNavigate();
  const player = players.get(result.id);
  const playerName = getPlayerName(player);
  const handleRowClick = useCallback(() => {
    if (player != null) {
      navigate(DynamicRoutes.player(player.id));
    }
  }, [navigate, player]);

  return (
    <Table.Tr
      key={result.id}
      onClick={handleRowClick}
      style={{ cursor: "pointer" }}
    >
      <Table.Td className="rank-row">
        <Group>
          <Text>{index + 1}</Text>
          {renderRankDelta && result.rankDelta != null && (
            <DeltaIcon delta={result.rankDelta} />
          )}
        </Group>
      </Table.Td>
      <Table.Td>{playerName}</Table.Td>
      <Table.Td>
        <Group>
          <Text>{result.points}</Text>
          {renderDelta && result.delta != null && (
            <DeltaIcon delta={result.delta} />
          )}
        </Group>
      </Table.Td>
      <Table.Td>{result.gamesPlayed}</Table.Td>
      <Table.Td>{(result.points / result.gamesPlayed).toFixed(2)}</Table.Td>
    </Table.Tr>
  );
});

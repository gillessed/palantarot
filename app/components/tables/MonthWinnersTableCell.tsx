import { Table, Text } from "@mantine/core";
import { memo } from "react";
import { Link } from "react-router";
import { Player } from "../../../server/model/Player";
import { MonthlyScore } from "../../../server/model/Records";
import { PlayerId } from "../../../server/play/model/GameState";
import { DynamicRoutes } from "../../../shared/routes";
import { getPlayerName } from "../../services/utils/playerName";

interface Props {
  playerId?: PlayerId;
  players: Map<PlayerId, Player>;
  score?: MonthlyScore;
}

export const MonthWinnersTableCell = memo(function MonthWinnersTableCell({
  playerId,
  players,
  score,
}: Props) {
  if (score == null) {
    return <Table.Td />;
  }
  const isSelf = playerId != null && playerId === score.playerId;
  const color = isSelf ? "#3DCC91" : "#FFFFFF";
  return (
    <Table.Td style={{ backgroundColor: color }}>
      <Text>
        <Link to={DynamicRoutes.player(score.playerId)}>
          <span>{getPlayerName(players.get(score.playerId))}</span>
        </Link>
        <span> ({score.score})</span>
      </Text>
    </Table.Td>
  );
});

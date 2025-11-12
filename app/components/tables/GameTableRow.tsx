import { Table } from "@mantine/core";
import { memo, useCallback, useMemo } from "react";
import { useNavigate } from "react-router";
import { GameRecord } from "../../../server/model/GameRecord";
import { Player } from "../../../server/model/Player";
import { formatTimestamp } from "../../../server/utils/index";
import { DynamicRoutes } from "../../../shared/routes";
import { GameOutcome } from "./GameTable";

interface Props {
  players: Map<string, Player>;
  game: GameRecord;
  outcome: GameOutcome;
}

export const GameTableRow = memo(function GameTable({
  players,
  game,
  outcome,
}: Props) {
  const navigate = useNavigate();

  const handleClick = useCallback(() => {
    navigate(DynamicRoutes.game(game.id));
  }, [game.id, navigate]);

  const bidder = players.get(game.bidderId);
  const bidderName = bidder
    ? `${bidder.firstName} ${bidder.lastName}`
    : `Unknown Player: ${game.bidderId}`;
  const partner =
    game.partnerId == null ? undefined : players.get(game.partnerId);
  const partnerName =
    partner != null
      ? `${partner.firstName} ${partner.lastName}`
      : `Unknown Player: ${game.partnerId}`;

  // const classes = classNames({
  //   ["outcome-unknown"]: this.props.outcome === GameOutcome.UNKNOWN,
  //   ["outcome-win"]: this.props.outcome === GameOutcome.WIN,
  //   ["outcome-loss"]: this.props.outcome === GameOutcome.LOSS,
  // });
  const color = useMemo(() => {
    switch(outcome) {
      case "unknown": return "gray.1";
      case "win": return "green.5";
      case "loss": return "red.5";
    }
  }, [outcome])
  return (
    <Table.Tr onClick={handleClick} bg={color} style={{ cursor: "pointer" }}>
      <Table.Td>{bidderName}</Table.Td>
      <Table.Td>{partnerName}</Table.Td>
      <Table.Td>{game.bidAmount}</Table.Td>
      <Table.Td>{game.points}</Table.Td>
      <Table.Td>{game.numberOfPlayers}</Table.Td>
      <Table.Td>{formatTimestamp(game.timestamp)}</Table.Td>
    </Table.Tr>
  );
});

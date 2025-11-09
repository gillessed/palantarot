import { memo, useCallback } from "react";
import { PlayerHand } from "../../../server/model/GameRecord";
import { PlayerId } from "../../../server/play/model/GameState";
import { Player } from "../../../server/model/Player";
import { getPlayerName } from "../../services/players/playerName";
import { Link, useNavigate } from "react-router";
import { DynamicRoutes } from "../../../shared/routes";
import { Group, Paper, Stack, Text, Title } from "@mantine/core";
import { ScoreBox } from "../../components/ScoreBox";
import classes from "./HandDataCard.module.css";

interface Props {
  label: string;
  players: Map<PlayerId, Player>;
  hand: PlayerHand;
}

export const HandDataCard = memo(function HandDataCard({
  players,
  hand,
  label,
}: Props) {
  const navigate = useNavigate();

  const handleClick = useCallback(() => {
    navigate(DynamicRoutes.player(player.id));
  }, [navigate]);

  const player = players.get(hand.id)!;
  const playerName = player
    ? `${getPlayerName(player)}`
    : `Unknown Player: ${hand.id}`;
  const points = hand.pointsEarned;
  let containerStyle: string = "player-container";
  if (points > 0) {
    containerStyle += " winner-container";
  } else {
    containerStyle += " loser-container";
  }
  const color = points > 0 ? "green" : points < 0 ? "red" : "orange";
  return (
    <Paper
      bd={`5px solid ${color}`}
      p={20}
      w={400}
      className={classes.card}
      onClick={handleClick}
    >
      <Group justify="space-between" align="flex-start">
        <Stack gap={0}>
          <Text c="gray.7">{label}</Text>
          <Title order={3}>{playerName}</Title>
        </Stack>
        <ScoreBox score={points} size="sm" />
      </Group>
    </Paper>
  );
});

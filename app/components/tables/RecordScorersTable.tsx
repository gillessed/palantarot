import { Group, Stack, Text, Title } from "@mantine/core";
import { memo, useMemo } from "react";
import { Link } from "react-router";
import { IMonth } from "../../../server/model/Month";
import { Player } from "../../../server/model/Player";
import { MonthlyScore, Records } from "../../../server/model/Records";
import { PlayerId } from "../../../server/play/model/GameState";
import { arrayMax } from "../../../server/utils";
import { DynamicRoutes } from "../../../shared/routes";

interface Props {
  playerId?: PlayerId;
  players: Map<string, Player>;
  records: Records;
}

export const RecordScorersTable = memo(function RecordScorersTable({
  records,
  players,
  playerId,
}: Props) {
  const monthlyScores: MonthlyScore[] = useMemo(() => {
    if (playerId != null) {
      return records.scores.filter((score) => score.playerId === playerId);
    } else {
      return records.scores;
    }
  }, [playerId, records]);

  const maxMonthlyScore = arrayMax(monthlyScores, ({ score }) => score)!;
  const maxMonthlyScorePlayer = players.get(maxMonthlyScore.playerId);
  const maxMonth = IMonth.get({
    month: maxMonthlyScore.month,
    year: maxMonthlyScore.year,
  });
  const minMonthlyScore = arrayMax(monthlyScores, ({ score }) => -score)!;
  const minMonthlyScorePlayer = players.get(minMonthlyScore.playerId);
  const minMonth = IMonth.get({
    month: minMonthlyScore.month,
    year: minMonthlyScore.year,
  });
  return (
    <Stack gap="xs">
      <Group gap={0}>
        <Title order={5} mr={10}>
          Highest Monthly Score:
        </Title>
        <Text>
          <Link to={DynamicRoutes.player(maxMonthlyScore.playerId)}>
            {Player.getName(maxMonthlyScore.playerId, maxMonthlyScorePlayer)}
          </Link>
          : {maxMonthlyScore.score} ({maxMonth.getHumanReadableString()})
        </Text>
      </Group>
      <Group gap={0}>
        <Title order={5} mr={10}>
          Lowest Monthly Score:
        </Title>
        <Text>
          <Link to={DynamicRoutes.player(minMonthlyScore.playerId)}>
            {Player.getName(minMonthlyScore.playerId, minMonthlyScorePlayer)}
          </Link>
          : {minMonthlyScore.score} ({minMonth.getHumanReadableString()})
        </Text>
      </Group>
    </Stack>
  );
});

import { Flex, Group, Paper, Stack, Text, Title } from "@mantine/core";
import { memo } from "react";
import { Player } from "../../../server/model/Player";
import { Result } from "../../../server/model/Result";
import { getPlayerName } from "../../services/utils/playerName";
import { ScoreBox } from "../../components/ScoreBox";

interface Props {
  player: Player;
  results: Result[];
}

export const PlayerBanner = memo(function PlayerBanner({
  player,
  results,
}: Props) {
  const playerName = getPlayerName(player);
  const sortedResults = results.sort((r1: Result, r2: Result) => {
    if (r1.all.points > r2.all.points) {
      return -1;
    } else if (r1.all.points < r2.all.points) {
      return 1;
    } else {
      return 0;
    }
  });
  const playerOrder = sortedResults.map((result) => result.id);
  const rankIndex = playerOrder.indexOf(player.id);
  const rank = rankIndex >= 0 ? rankIndex + 1 : undefined;
  const playerCount = playerOrder.length;
  const playerResult = sortedResults.find((result) => result.id === player.id);
  const score = playerResult ? playerResult.all.points : 0;
  const rankString = rank ? `${rank} / ${playerCount}` : "N/A";
  return (
    <Paper bg="gray.1" p={30}>
      <Group justify="space-between">
        <Stack gap={0} justify="space-around">
          <Title order={1}> {playerName} </Title>
          <Text ff="blenderProMediumItalic"> Monthly Rank: {rankString} </Text>
        </Stack>
        <ScoreBox score={score} size="lg" />
      </Group>
    </Paper>
  );
});

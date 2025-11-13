import { Center, Group, Stack, Text, Title } from "@mantine/core";
import { memo } from "react";
import type { Streak } from "../../../server/model/Streak";
import { AsyncView } from "../../components/asyncView/AsyncView";
import { StreaksLoader } from "../../services/loaders/StreaksLoader";

interface LoadedProps {
  streaks: Streak[];
}

const PlayerStreaksTabLoaded = memo(function PlayerStreaksTabLoaded({
  streaks,
  playerId,
}: LoadedProps & TabProps) {
  const winStreak = streaks.find(
    (streak) => streak.playerId === playerId && streak.win
  );
  const lossStreak = streaks.find(
    (streak) => streak.playerId === playerId && !streak.win
  );
  if (winStreak == null && lossStreak == null) {
    return (
      <Center mt={20}>
        <Text>No streaks yet</Text>
      </Center>
    );
  }

  return (
    <Stack gap="xs" mt={20}>
      {winStreak != null && (
        <Group gap={0}>
          <Title order={5} mr={10}>
            Longest Win Streak:
          </Title>
          <Text>{winStreak.gameCount}</Text>
        </Group>
      )}
      {lossStreak != null && (
        <Group gap={0}>
          <Title order={5} mr={10}>
            Longest Loss Streak:
          </Title>
          <Text>{lossStreak.gameCount}</Text>
        </Group>
      )}
    </Stack>
  );
});

const Loaders = {
  streaks: StreaksLoader,
};
type Loaders = typeof Loaders;
const Args = { streaks: undefined };

interface TabProps {
  playerId: string;
}

export const PlayerStreaksTab = memo(function PlayerStreaksTab({
  playerId,
}: TabProps) {
  return (
    <AsyncView<Loaders, TabProps>
      loaders={Loaders}
      args={Args}
      Component={PlayerStreaksTabLoaded}
      additionalArgs={{ playerId }}
    />
  );
});

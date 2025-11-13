import { Group, Stack, Title } from "@mantine/core";
import { memo, useMemo } from "react";
import { Player } from "../../../server/model/Player";
import type { Streak } from "../../../server/model/Streak";
import { PlayerId } from "../../../server/play/model/GameState";
import { AsyncView } from "../../components/asyncView/AsyncView";
import { StreaksTable } from "../../components/tables/StreaksTable";
import { PlayersLoader } from "../../services/PlayersLoader";
import { StreaksLoader } from "../../services/StreaksLoader";

interface LoadedProps {
  streaks: Streak[];
  players: Map<PlayerId, Player>;
}

const RecordsStreaksTabLoaded = memo(function RecordsStreaksTabLoaded({
  streaks,
  players,
}: LoadedProps) {
  const winStreaks = useMemo(
    () => streaks.filter((streak) => streak.win),
    [streaks]
  );
  const lossStreaks = useMemo(
    () => streaks.filter((streak) => !streak.win),
    [streaks]
  );
  return (
    <Group gap="xs" mt={20} justify="center">
      <Stack>
        <Title order={3}>Win Streaks</Title>
        <StreaksTable players={players} streaks={winStreaks} />
      </Stack>
      <Stack>
        <Title order={3}>Loss Streaks</Title>
        <StreaksTable players={players} streaks={lossStreaks} />
      </Stack>
    </Group>
  );
});

const Loaders = {
  players: PlayersLoader,
  streaks: StreaksLoader,
};
type Loaders = typeof Loaders;
const Args = { streaks: undefined, players: undefined };

export const RecordsStreaksTab = memo(function RecordsStreaksTab() {
  return (
    <AsyncView<Loaders>
      loaders={Loaders}
      args={Args}
      Component={RecordsStreaksTabLoaded}
    />
  );
});

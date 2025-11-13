import { Stack, Title } from "@mantine/core";
import { memo, useMemo } from "react";
import { Deltas } from "../../../server/model/Delta";
import { Player } from "../../../server/model/Player";
import type { PlayerId } from "../../../server/play/model/GameState";
import { AsyncView } from "../../components/asyncView/AsyncView";
import { DeltasTable } from "../../components/tables/DeltasTable";
import {
  DefaultDeltaLoad,
  DeltasLoader,
} from "../../services/loaders/DeltasLoader";

interface LoadedProps {
  deltas: Deltas;
}

interface AdditionalProps {
  players: Map<string, Player>;
}

const PlayerDeltasTabLoaded = memo(function PlayerDeltasTabLoaded({
  deltas,
  players,
}: LoadedProps & AdditionalProps) {
  return (
    <Stack>
      <Title order={3} mt={20}>
        Highest Deltas
      </Title>
      <DeltasTable
        deltas={deltas.maximums}
        players={players}
        title="Highest Deltas"
      />
      <Title order={3}>Lowest Deltas</Title>
      <DeltasTable
        deltas={deltas.minimums}
        players={players}
        title="Lowest Deltas"
      />
    </Stack>
  );
});

const Loaders = {
  deltas: DeltasLoader,
};
type Loaders = typeof Loaders;

interface Props {
  playerId: string;
  players: Map<PlayerId, Player>;
}

export const PlayerDeltasTab = memo(function PlayerDeltasTab({
  playerId,
  players,
}: Props) {
  const args = useMemo(
    () => ({
      deltas: {
        playerId,
        length: DefaultDeltaLoad,
      },
    }),
    [playerId]
  );

  return (
    <AsyncView<Loaders, AdditionalProps>
      loaders={Loaders}
      args={args}
      Component={PlayerDeltasTabLoaded}
      additionalArgs={{
        players,
      }}
    />
  );
});

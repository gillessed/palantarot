import { Stack, Title } from "@mantine/core";
import { memo } from "react";
import { Deltas } from "../../../server/model/Delta";
import { Player } from "../../../server/model/Player";
import { AsyncView } from "../../components/asyncView/AsyncView";
import { DeltasTable } from "../../components/tables/DeltasTable";
import { DefaultDeltaLoad, DeltasLoader } from "../../services/DeltasLoader";
import { PlayersLoader } from "../../services/PlayersLoader";

interface LoadedProps {
  deltas: Deltas;
}

interface AdditionalProps {
  players: Map<string, Player>;
}

const RecordsDeltasTabLoaded = memo(function RecordsDeltasTabLoaded({
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
  players: PlayersLoader,
  deltas: DeltasLoader,
};
type Loaders = typeof Loaders;

const Args = {
  deltas: {
    length: DefaultDeltaLoad,
  },
};

export const RecordsDeltasTab = memo(function RecordsDeltasTab() {
  return (
    <AsyncView<Loaders>
      loaders={Loaders}
      args={Args}
      Component={RecordsDeltasTabLoaded}
    />
  );
});

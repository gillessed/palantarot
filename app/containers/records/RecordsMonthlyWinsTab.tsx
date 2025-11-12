import { Stack, Title } from "@mantine/core";
import { memo } from "react";
import { Player } from "../../../server/model/Player";
import { Records } from "../../../server/model/Records";
import { PlayerId } from "../../../server/play/model/GameState";
import { AsyncView } from "../../components/asyncView/AsyncView";
import { MonthWinnersTable } from "../../components/tables/MonthWinnersTable";
import { RecordScorersTable } from "../../components/tables/RecordScorersTable";
import { RecordsLoader } from "../../services/RecordsLoader";
import { MedalsTable } from "../../components/tables/MedalsTable";

interface LoadedProps {
  records: Records;
}

const RecordMonthlyWinsTabLoaded = memo(function RecordMonthlyWinsTabLoaded({
  records,
  players,
}: LoadedProps & TabProps) {
  return (
    <Stack>
      <Title order={3} mt={20}>
        Month Records
      </Title>
      <RecordScorersTable players={players} records={records} />
      <Title order={3} mt={20}>
        Month Winners
      </Title>
      <MonthWinnersTable players={players} records={records} />
      <Title order={3} mt={20}>
        Medals
      </Title>
      <MedalsTable players={players} records={records} />
    </Stack>
  );
});

interface TabProps {
  playerId?: string;
  players: Map<PlayerId, Player>;
}

const Loaders = {
  records: RecordsLoader,
};
type Loaders = typeof Loaders;

const Args = {
  records: undefined,
};

export const RecordMonthlyWinsTab = memo(function RecordMonthlyWinsTab(
  props: TabProps
) {
  return (
    <AsyncView<Loaders, TabProps>
      loaders={Loaders}
      args={Args}
      Component={RecordMonthlyWinsTabLoaded}
      additionalArgs={props}
    />
  );
});

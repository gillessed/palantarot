import { Stack, Title } from "@mantine/core";
import { memo } from "react";
import { Player } from "../../../server/model/Player";
import { Records } from "../../../server/model/Records";
import { PlayerId } from "../../../server/play/model/GameState";
import { AsyncView } from "../../components/asyncView/AsyncView";
import { MedalsTable } from "../../components/tables/MedalsTable";
import { MonthWinnersTable } from "../../components/tables/MonthWinnersTable";
import { RecordScorersTable } from "../../components/tables/RecordScorersTable";
import { PlayersLoader } from "../../services/PlayersLoader";
import { RecordsLoader } from "../../services/RecordsLoader";

interface LoadedProps {
  records: Records;
  players: Map<PlayerId, Player>;
}

const RecordsMonthlyWinsTabLoaded = memo(function RecordsMonthlyWinsTabLoaded({
  records,
  players,
}: LoadedProps) {
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

const Loaders = {
  players: PlayersLoader,
  records: RecordsLoader,
};
type Loaders = typeof Loaders;

export const RecordsMonthlyWinsTab = memo(function RecordsMonthlyWinsTab() {
  return (
    <AsyncView<Loaders>
      loaders={Loaders}
      Component={RecordsMonthlyWinsTabLoaded}
    />
  );
});

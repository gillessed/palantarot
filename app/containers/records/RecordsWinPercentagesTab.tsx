import { Checkbox, Stack } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { memo } from "react";
import { Player } from "../../../server/model/Player";
import { StatAverage, Stats } from "../../../server/model/Stats";
import { PlayerId } from "../../../server/play/model/GameState";
import { AsyncView } from "../../components/asyncView/AsyncView";
import { WinPercentagesTable } from "../../components/tables/WinPercentagesTable";
import { PlayersLoader } from "../../services/PlayersLoader";
import { StatsLoader } from "../../services/StatsLoader";
import { useStatEntriesByPlayer } from "../../services/useAggregatedStats";

interface Props {
  stats: Stats;
  players: Map<PlayerId, Player>;
}

const StatsPlayerFilter = (stat: StatAverage) => stat.totalCount >= 100;

const RecordsWinPercentagesTabLoaded = memo(
  function RecordsWinPercentagesTabLoaded({ stats, players }: Props) {
    const [filterRecords, { toggle: toggleFilter }] = useDisclosure(false);
    const statEntries = useStatEntriesByPlayer(
      players,
      stats,
      filterRecords ? StatsPlayerFilter : undefined
    );
    return (
      <Stack mt={20}>
        <Checkbox
          checked={filterRecords}
          label="Filter players who have played less than 100 games: "
          onChange={toggleFilter}
        />
        <WinPercentagesTable
          leftColumnName="Player"
          statEntries={statEntries}
        />
      </Stack>
    );
  }
);

const Loaders = {
  stats: StatsLoader,
  players: PlayersLoader,
};
type Loaders = typeof Loaders;

export const RecordsWinPercentagesTab = memo(
  function RecordsWinPercentagesTab() {
    return (
      <AsyncView<Loaders>
        loaders={Loaders}
        Component={RecordsWinPercentagesTabLoaded}
      />
    );
  }
);

import { Checkbox, Stack } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { memo } from "react";
import { StatAverage, Stats } from "../../../server/model/Stats";
import { AsyncView } from "../../components/asyncView/AsyncView";
import { WinPercentagesTable } from "../../components/tables/WinPercentagesTable";
import { StatsLoader } from "../../services/StatsLoader";
import {
  useStatEntriesForPlayerByMonth
} from "../../services/useAggregatedStats";

interface LoadedProps {
  stats: Stats;
}

const StatsPlayerFilter = (stat: StatAverage) => stat.totalCount >= 100;

const PlayerWinPercentagesTabLoaded = memo(
  function PlayerWinPercentagesTabLoaded({
    stats,
    playerId,
  }: LoadedProps & TabProps) {
    const [filterRecords, { toggle: toggleFilter }] = useDisclosure(false);
    const statEntries = useStatEntriesForPlayerByMonth(
      playerId,
      stats,
      filterRecords ? StatsPlayerFilter : undefined
    );
    // TODO: sort entries by key (year/month)
    return (
      <Stack mt={20}>
        <Checkbox
          checked={filterRecords}
          label="Filter players who have played less than 100 games: "
          onChange={toggleFilter}
        />
        <WinPercentagesTable
          leftColumnName="Month"
          statEntries={statEntries}
        />
      </Stack>
    );
  }
);

interface TabProps {
  playerId: string;
}

const Loaders = {
  stats: StatsLoader,
};
type Loaders = typeof Loaders;

const Args = {
  stats: undefined,
};

export const PlayerWinPercentagesTab = memo(function PlayerWinPercentagesTab(
  props: TabProps
) {
  return (
    <AsyncView<Loaders, TabProps>
      loaders={Loaders}
      args={Args}
      Component={PlayerWinPercentagesTabLoaded}
      additionalArgs={props}
    />
  );
});

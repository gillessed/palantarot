import { Checkbox, Stack } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { memo } from "react";
import { Player } from "../../../server/model/Player";
import { Records } from "../../../server/model/Records";
import { RoleResult } from "../../../server/model/Result";
import { AsyncView } from "../../components/asyncView/AsyncView";
import { ScoreTable } from "../../components/scoreTable/ScoreTable";
import { PlayersLoader } from "../../services/loaders/PlayersLoader";
import { RecordsLoader } from "../../services/loaders/RecordsLoader";
import { useTotalScores } from "../../services/selectors/useTotalScores";

interface Props {
  players: Map<string, Player>;
  records: Records;
}

const GamesPlayerFilter = (result: RoleResult) => result.gamesPlayed >= 100;

const RecordsAllTimeTabLoaded = memo(function RecordsAllTimeTabLoaded({
  players,
  records,
}: Props) {
  const [filterRecords, { toggle: toggleFilter }] = useDisclosure(false);
  const totalScores = useTotalScores(
    records.scores,
    filterRecords ? GamesPlayerFilter : undefined
  );
  return (
    <Stack mt={20}>
      <Checkbox
        checked={filterRecords}
        label="Filter players who have played less than 100 games: "
        onChange={toggleFilter}
      />
      <ScoreTable results={totalScores} players={players} />
    </Stack>
  );
});

const Loaders = {
  players: PlayersLoader,
  records: RecordsLoader,
};
type Loaders = typeof Loaders;

export const RecordsAllTimeTab = memo(function RecordsAllTimeTab() {
  return (
    <AsyncView<Loaders> loaders={Loaders} Component={RecordsAllTimeTabLoaded} />
  );
});

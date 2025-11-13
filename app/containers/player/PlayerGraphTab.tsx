import { Center, Space, Stack } from "@mantine/core";
import { memo, useCallback, useMemo, useState } from "react";
import { GameRecord } from "../../../server/model/GameRecord";
import { IMonth } from "../../../server/model/Month";
import { Player } from "../../../server/model/Player";
import type { PlayerId } from "../../../server/play/model/GameState";
import { AsyncView } from "../../components/asyncView/AsyncView";
import { PointsGraph } from "../../components/graphs/PointsGraph";
import { MonthPicker } from "../../components/MonthPicker";
import { GamesForMonthLoader } from "../../services/loaders/GamesForMonthLoader";

interface LoadedProps {
  games: GameRecord[];
}

interface AdditionalProps {
  playerId: string;
  players: Map<string, Player>;
}

const PlayerGraphTabLoaded = memo(function PlayerGraphTabLoaded({
  games,
  playerId,
  players,
}: LoadedProps & AdditionalProps) {
  if (games.length === 0) {
    return <Center className="bp3-heading">No games for this month.</Center>;
  }
  const playerFilter = useCallback(
    (idToFilter: PlayerId) => playerId === idToFilter,
    [playerId]
  );

  return (
    <PointsGraph games={games} players={players} playerFilter={playerFilter} />
  );
});

const Loaders = {
  games: GamesForMonthLoader,
};
type Loaders = typeof Loaders;

interface Props {
  playerId: string;
  players: Map<PlayerId, Player>;
}

export const PlayerGraphTab = memo(function PlayerGraphTab({
  playerId,
  players,
}: Props) {
  const [month, setMonth] = useState<IMonth>(IMonth.now());

  const args = useMemo(() => ({ games: month }), [month]);

  return (
    <Stack mt={20}>
      <MonthPicker month={month} onChanged={setMonth} />
      <Space />
      <AsyncView<Loaders, AdditionalProps>
        loaders={Loaders}
        args={args}
        Component={PlayerGraphTabLoaded}
        additionalArgs={{
          playerId,
          players,
        }}
      />
    </Stack>
  );
});

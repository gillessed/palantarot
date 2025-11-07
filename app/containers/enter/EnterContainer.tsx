import { Container } from "@mantine/core";
import { memo, useMemo } from "react";
import { RecentGameQuery } from "../../../server/db/GameRecordQuerier";
import { AsyncView } from "../../components/asyncView/AsyncView";
import { usePlayersLoader } from "../../services/usePlayersLoader";
import { useRecentGamesLoader } from "../../services/useRecentGamesLoader";
import { EnterScoreView } from "./EnterScoreView";

const GameQuery: RecentGameQuery = { count: 10, full: true };

export const EnterContainer = memo(function EnterContainer() {
  const playersLoader = usePlayersLoader();
  const recentGamesLoader = useRecentGamesLoader();

  const loaders = useMemo(
    () => ({
      players: playersLoader,
      recentGames: recentGamesLoader,
    }),
    [playersLoader]
  );
  const args = useMemo(
    () => ({
      players: undefined,
      recentGames: GameQuery,
    }),
    []
  );

  return (
    <Container size="lg">
      <AsyncView<typeof loaders> loaders={loaders} args={args} Component={EnterScoreView} />
    </Container>
  );
});

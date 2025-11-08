import { Container } from "@mantine/core";
import { memo } from "react";
import { RecentGameQuery } from "../../../server/db/GameRecordQuerier";
import { AsyncView } from "../../components/asyncView/AsyncView";
import { PlayersLoader } from "../../services/PlayersLoader";
import { RecentGamesLoader } from "../../services/useRecentGamesLoader";
import { EnterScoreView } from "./EnterScoreView";

const GameQuery: RecentGameQuery = { count: 10, full: true };

const Loaders = {
  players: PlayersLoader,
  recentGames: RecentGamesLoader,
}
const Args = {
  players: undefined,
  recentGames: GameQuery,
}

type LoadersType = typeof Loaders;

export const EnterContainer = memo(function EnterContainer() {
  return (
    <Container size="lg">
      <AsyncView<LoadersType> loaders={Loaders} args={Args} Component={EnterScoreView} />
    </Container>
  );
});

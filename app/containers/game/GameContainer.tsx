import { memo, useMemo } from "react";
import { useParams } from "react-router";
import { AsyncView } from "../../components/asyncView/AsyncView";
import { ErrorAlert } from "../../components/ErrorAlert";
import { PageContainer } from "../PageContainer";
import { GameView } from "./GameView";
import { GameLoader } from "../../services/loaders/GameLoader";
import { PlayersLoader } from "../../services/loaders/PlayersLoader";

const Loaders = {
  game: GameLoader,
  players: PlayersLoader,
};
type Loaders = typeof Loaders;

export const GameContainer = memo(function GameContainer() {
  const { gameId } = useParams();
  if (gameId == null) {
    return <ErrorAlert> No game id </ErrorAlert>;
  }

  const args = useMemo(() => ({ game: gameId }), [gameId]);

  return (
    <PageContainer>
      <AsyncView<Loaders> loaders={Loaders} args={args} Component={GameView} />
    </PageContainer>
  );
});

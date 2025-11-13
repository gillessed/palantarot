import { memo, useMemo } from "react";
import { useParams } from "react-router";
import { AsyncView } from "../../components/asyncView/AsyncView";
import { ErrorAlert } from "../../components/ErrorAlert";
import { PageContainer } from "../PageContainer";
import { EditGameView } from "./EditGameView";
import { PlayersLoader } from "../../services/loaders/PlayersLoader";
import { GameLoader } from "../../services/loaders/GameLoader";

const Loaders = {
  players: PlayersLoader,
  game: GameLoader,
};
type Loaders = typeof Loaders;

export const EditGameContainer = memo(function EditGameContainer() {
  const { gameId } = useParams();
  if (gameId == null) {
    return <ErrorAlert> No game id </ErrorAlert>;
  }

  const args = useMemo(() => ({ game: gameId }), [gameId]);

  return (
    <PageContainer title={`Edit Game ${gameId}`}>
      <AsyncView<Loaders>
        loaders={Loaders}
        args={args}
        Component={EditGameView}
      />
    </PageContainer>
  );
});

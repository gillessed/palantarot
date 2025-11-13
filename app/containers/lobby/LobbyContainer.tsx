import { memo } from "react";
import { AsyncView } from "../../components/asyncView/AsyncView";
import { PlayersLoader } from "../../services/loaders/PlayersLoader";
import { LobbyView } from "./LobbyView";
import { PageContainer } from "../PageContainer";

const Loaders = {
  players: PlayersLoader,
};
type Loaders = typeof Loaders;

export const LobbyContainer = memo(function LobbyContainer() {
  return (
    <PageContainer title="Game Lobby">
      <AsyncView<Loaders> loaders={Loaders} Component={LobbyView} />
    </PageContainer>
  );
});

import { memo } from "react";
import { AsyncView } from "../../components/asyncView/AsyncView";
import { PageContainer } from "../PageContainer";
import { BotsView } from "./BotsView";
import { PlayersLoader } from "../../services/loaders/PlayersLoader";

const Loaders = {
  players: PlayersLoader,
};
type Loaders = typeof Loaders;

export const BotsContainer = memo(function BotsContainer() {
  return (
    <PageContainer title="Bots">
      <AsyncView<Loaders> loaders={Loaders} Component={BotsView} />
    </PageContainer>
  );
});

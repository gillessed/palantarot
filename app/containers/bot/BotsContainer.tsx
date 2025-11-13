import { memo } from "react";
import { AsyncView } from "../../components/asyncView/AsyncView";
import { PlayersLoader } from "../../services/PlayersLoader";
import { PageContainer } from "../PageContainer";
import { BotsView } from "./BotsView";

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

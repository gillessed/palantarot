import { Container } from "@mantine/core";
import { memo } from "react";
import { useParams } from "react-router";
import { IMonth } from "../../../server/model/Month";
import { AsyncView } from "../../components/asyncView/AsyncView";
import { ErrorAlert } from "../../components/ErrorAlert";
import { PlayersLoader } from "../../services/PlayersLoader";
import { ResultsLoader } from "../../services/ResultsLoader";
import { PlayerView } from "./PlayerView";
import { PageContainer } from "../PageContainer";

// load results
const Loaders = {
  players: PlayersLoader,
  results: ResultsLoader,
};

type LoadersType = typeof Loaders;
type AdditionalArgs = {
  playerId: string;
}

const args = { players: undefined, results: IMonth.now() };

export const PlayerContainer = memo(function PlayerContainer({}) {
  const { playerId } = useParams();

  if (playerId == null) {
    return <ErrorAlert> Not player id</ErrorAlert>
  }

  return (
    <PageContainer>
      <AsyncView<LoadersType, AdditionalArgs>
        loaders={Loaders}
        args={args}
        Component={PlayerView}
        additionalArgs={{ playerId }}
      />
    </PageContainer>
  );
});

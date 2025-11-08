import { Container } from "@mantine/core";
import { memo } from "react";
import { useParams } from "react-router";
import { AsyncView } from "../../components/asyncView/AsyncView";
import { PlayersLoader } from "../../services/PlayersLoader";
import { PlayerView } from "./PlayerView";

// load results
const Loaders = {
  players: PlayersLoader
}

type LoadersType = typeof Loaders;
type AdditionalArgs = {
  playerId: string;
}

const args = { players: undefined };

export const PlayerContainer = memo(function PlayerContainer({}) {
  const { playerId } = useParams();

  if (playerId == null) {
    throw Error("Player does not have id");
  }

  return (
    <Container size="lg">
      <AsyncView<LoadersType, AdditionalArgs>
        loaders={Loaders}
        args={args}
        Component={PlayerView}
        additionalArgs={{ playerId }}
      />
    </Container>
  );
});

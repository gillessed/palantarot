import { memo, useMemo } from "react";
import { useParams } from "react-router";
import { AsyncView } from "../../components/asyncView/AsyncView";
import { ErrorAlert } from "../../components/ErrorAlert";
import { useGamePlayerId } from "../../context/GamePlayerIdContext";
import { PlayersLoader } from "../../services/loaders/PlayersLoader";
import { RoomLoader } from "../../services/loaders/RoomLoader";
import { PlayView } from "./PlayView";

const Loaders = {
  players: PlayersLoader,
  room: RoomLoader,
};
type Loaders = typeof Loaders;
type AdditionalProps = {
  gamePlayerId: string;
};

export const PlayContainer = memo(function PlayContainer() {
  const { roomId } = useParams();
  const gamePlayerId = useGamePlayerId();

  if (gamePlayerId == null) {
    return <ErrorAlert> Must choose a player to play tarot. </ErrorAlert>;
  }

  if (roomId == null) {
    return <ErrorAlert> Invalid room id. </ErrorAlert>;
  }

  const args = useMemo(() => ({ room: roomId }), [roomId]);

  return (
    <AsyncView<Loaders, AdditionalProps>
      loaders={Loaders}
      args={args}
      Component={PlayView}
      additionalArgs={{ gamePlayerId }}
    />
  );
});

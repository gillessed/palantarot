import { memo, useMemo } from "react";
import {
  useGamePlayerId,
  useOpenGamePlayerDialog,
} from "../../context/GamePlayerIdContext";
import { Avatar, Loader } from "@mantine/core";
import type { Player } from "../../../server/model/Player";
import type { PlayerId } from "../../../server/play/model/GameState";
import { PlayersLoader } from "../../services/loaders/PlayersLoader";
import { AsyncView } from "../../components/asyncView/AsyncView";

interface LoadedProps {
  players: Map<PlayerId, Player>;
}

interface OtherProps {
  gamePlayerId: PlayerId;
}

const PlayerAvatarLoaded = memo(function PlayerAvatarLoaded({
  gamePlayerId,
  players,
}: LoadedProps & OtherProps) {
  const openGamePlayerDialog = useOpenGamePlayerDialog();
  const player = players.get(gamePlayerId);
  const playerInitials =
    player != null
      ? `${player.firstName.slice(0, 1)}${player.lastName.slice(
          0,
          1
        )}`.toLocaleUpperCase()
      : "??";
  return (
    <Avatar
      radius="xl"
      onClick={openGamePlayerDialog}
      style={{ cursor: "pointer" }}
      color={playerInitials !== "??" ? "blue.9" : "gray"}
    >
      {playerInitials}
    </Avatar>
  );
});

const Loaders = {
  players: PlayersLoader,
};
type Loaders = typeof Loaders;

export const PlayerAvatar = memo(function PlayerAvatar() {
  const gamePlayerId = useGamePlayerId();
  const openGamePlayerDialog = useOpenGamePlayerDialog();
  if (gamePlayerId == null) {
    return (
      <Avatar
        radius="xl"
        onClick={openGamePlayerDialog}
        style={{ cursor: "pointer" }}
      />
    );
  } else {
    return (
      <AsyncView<Loaders, OtherProps>
        loaders={Loaders}
        additionalArgs={{ gamePlayerId }}
        Component={PlayerAvatarLoaded}
        loadingElement={<Loader type="dots" size="xs" w={38} />}
      />
    );
  }
});

import { Container, Group } from "@mantine/core";
import { memo, useCallback } from "react";
import { useNavigate } from "react-router";
import { Player } from "../../../server/model/Player";
import { DynamicRoutes } from "../../../shared/routes";
import { AddPlayerForm } from "../../components/forms/AddPlayerForm";
import { useAddPlayer } from "../../services/useAddPlayer";
import { isAsyncLoading } from "../../utils/Async";
import { notifications } from '@mantine/notifications';
import { getPlayerName } from "../../services/players/playerName";

export const AddPlayerContainer = memo(function AddPlayerContainer() {
  const navigate = useNavigate();
  const onPlayerAdded = useCallback((result: Player) => {
    navigate(DynamicRoutes.player(result.id));
    notifications.show({
      position: "top-center",
      color: "green",
      title: "Success",
      message: `${getPlayerName(result)} created.`,
    });
  }, [navigate]);
  const { state: addingPlayer, request: addPlayer } = useAddPlayer(onPlayerAdded);

  return (
    <Container size="lg">
      <Group justify="center"><h1 className="bp3-heading">Add Player</h1></Group>
      <AddPlayerForm loading={isAsyncLoading(addingPlayer)} onSubmit={addPlayer} />
    </Container>
  );
});

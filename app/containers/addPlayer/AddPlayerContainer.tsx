import { memo, useCallback } from "react";
import { useNavigate } from "react-router";
import { Player } from "../../../server/model/Player";
import { DynamicRoutes } from "../../../shared/routes";
import { AddPlayerForm } from "../../components/forms/AddPlayerForm";
import { showSuccessNotification } from "../../notifications/showSuccessNotification";
import { getPlayerName } from "../../services/players/playerName";
import { useAddPlayer } from "../../services/useAddPlayer";
import { isAsyncLoading } from "../../utils/Async";
import { PageContainer } from "../PageContainer";

export const AddPlayerContainer = memo(function AddPlayerContainer() {
  const navigate = useNavigate();
  const onPlayerAdded = useCallback(
    (result: Player) => {
      navigate(DynamicRoutes.player(result.id));
      showSuccessNotification(`${getPlayerName(result)} created.`);
    },
    [navigate]
  );
  const { state: addingPlayer, request: addPlayer } = useAddPlayer(onPlayerAdded);

  return (
    <PageContainer title="Add Player">
      <AddPlayerForm loading={isAsyncLoading(addingPlayer)} onSubmit={addPlayer} />
    </PageContainer>
  );
});

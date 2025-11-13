import { memo, useCallback } from "react";
import { GameRecord } from "../../../server/model/GameRecord";
import { Player } from "../../../server/model/Player";
import { PlayerId } from "../../../server/play/model/GameState";
import { GameForm } from "../../components/forms/GameForm";
import { useSaveGame } from "../../services/apis/useSaveGame";
import { isAsyncLoading } from "../../utils/Async";
import { useNavigate } from "react-router";
import { DynamicRoutes } from "../../../shared/routes";
import { showSuccessNotification } from "../../notifications/showSuccessNotification";

interface Props {
  game: GameRecord;
  players: Map<PlayerId, Player>;
}

export const EditGameView = memo(function EditGameView({
  game,
  players,
}: Props) {
  const navigate = useNavigate();
  const handleGameSaved = useCallback(() => {
    showSuccessNotification(`Game ${game.id} saved`);
    navigate(DynamicRoutes.game(game.id));
  }, [navigate, game.id]);
  const { state: savingGame, request: saveGame } = useSaveGame(handleGameSaved);
  return (
    <GameForm
      loading={isAsyncLoading(savingGame)}
      game={game}
      players={players}
      submitText="Update Game"
      onSubmit={saveGame}
    />
  );
});

import { memo, useCallback, useMemo } from "react";
import { useNavigate } from "react-router";
import { GameRecord } from "../../../server/model/GameRecord";
import { Player } from "../../../server/model/Player";
import { StaticRoutes } from "../../../shared/routes";
import { GameForm } from "../../components/forms/GameForm";
import { useSaveGame } from "../../services/apis/useSaveGame";
import { isAsyncLoading } from "../../utils/Async";

interface Props {
  players: Map<string, Player>;
  recentGames: GameRecord[];
}

function getPlayersInGame(game: GameRecord): string[] {
  if (!game.handData) {
    return [];
  }
  const playerIds: string[] = [];
  playerIds.push(game.handData.bidder.id);
  if (game.handData.partner) {
    playerIds.push(game.handData.partner.id);
  }
  game.handData.opposition.forEach((hand) => {
    playerIds.push(hand.id);
  });
  return playerIds;
}

export const EnterScoreView = memo(function EnterScoreView({
  players,
  recentGames,
}: Props) {
  const recentPlayers = useMemo(() => {
    if (recentGames.length >= 1) {
      const playerSet = new Set<string>();
      recentGames
        .map((game) => getPlayersInGame(game))
        .forEach((playerIds: string[]) => {
          playerIds.forEach((playerId) => {
            if (playerSet.size < 13) {
              playerSet.add(playerId);
            }
          });
        });
      const recentPlayers: Player[] = [];
      playerSet.forEach((playerId) => {
        const maybePlayer = players.get(playerId);
        if (maybePlayer) {
          recentPlayers.push(maybePlayer);
        }
      });
      return recentPlayers.sort((p1: Player, p2: Player) => {
        const n1 = `${p1.firstName}${p1.lastName}`;
        const n2 = `${p2.firstName}${p2.lastName}`;
        return n1.localeCompare(n2);
      });
    } else {
      return undefined;
    }
  }, [players, recentGames]);

  const navigate = useNavigate();
  const handleOnSave = useCallback(() => {
    navigate(StaticRoutes.results());
  }, [navigate]);
  const { state: saveGameState, request: saveGame } = useSaveGame(handleOnSave);
  const handleSubmit = useCallback(
    (newGame: GameRecord) => {
      saveGame(newGame);
    },
    [saveGame]
  );

  return (
    <GameForm
      recentPlayers={recentPlayers}
      players={players}
      submitText="Enter Score"
      onSubmit={handleSubmit}
      loading={isAsyncLoading(saveGameState)}
    />
  );
});

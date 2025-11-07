import { memo, useCallback, useMemo } from "react";
import { GameRecord } from "../../../server/model/GameRecord";
import { Player } from "../../../server/model/Player";
import { GameForm } from "../../components/forms/GameForm";
import { useSaveGame } from "../../services/useSaveGame";
import { useNavigate } from "react-router";
import { StaticRoutes } from "../../../shared/routes";
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

export const EnterScoreView = memo(function EnterScoreView({ players, recentGames }: Props) {
  const playerList = useMemo(() => {
    const list = Array.from(players.values());
    return list.sort((p1: Player, p2: Player) => {
      const n1 = `${p1.firstName}${p1.lastName}`;
      const n2 = `${p2.firstName}${p2.lastName}`;
      return n1.localeCompare(n2);
    });
  }, [players]);

  const recentPlayers = useMemo(() => {
    if (recentGames.length >= 2) {
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
  const handleSubmit = useCallback((newGame: GameRecord) => {
    saveGame(newGame);
  }, [saveGame]);

  return (
    <GameForm recentPlayers={recentPlayers} players={playerList} submitText="Enter Score" onSubmit={handleSubmit} loading={isAsyncLoading(saveGameState)} />
  );

  // public componentWillMount() {
  //   this.sagas.register(this.gameSavedListener);
  //   this.sagas.register(this.gameSaveErrorListener);
  //   this.dispatchers.players.request(undefined);
  //   this.dispatchers.recentGames.request({ count: 10, full: true });
  // }

  // public render() {
  //   return (
  //     <div className="enter-container page-container">
  //       <div className="title">
  //         <h1 className="bp3-heading">Enter Score</h1>
  //       </div>
  //       {this.renderContainer()}
  //     </div>
  //   );
  // }

  // private renderContainer() {
  //   const players = this.props.players;
  //   const saveGame = this.props.saveGame;
  //   const recentGames = this.props.recentGames;
  //   if (players.loading || saveGame.loading || recentGames.loading) {
  //     return <SpinnerOverlay size={Spinner.SIZE_LARGE} />;
  //   } else if (players.value && recentGames.value) {
  //     return this.renderPage(players.value, recentGames.value);
  //   } else if (players.error) {
  //     return <p>Error loading players: {this.props.players.error}</p>;
  //   } else if (recentGames.error) {
  //     return <p>Error loading recent games: {this.props.recentGames.error}</p>;
  //   } else {
  //     return <p>Something went wrong...</p>;
  //   }
  // }

  // private renderPage(players: Map<string, Player>, recentGames: GameRecord[]) {
  //   const recentPlayers = this.getRecentPlayerList(players, recentGames);
  //   let playerList = this.getPlayerList(players);
  //   return (
  //     <GameForm recentPlayers={recentPlayers} players={playerList} submitText="Enter Score" onSubmit={this.onSubmit} />
  //   );
  // }

  // private onSubmit = (newGame: GameRecord) => {
  //   this.dispatchers.saveGame.request(newGame);
  // };

  return null;
});

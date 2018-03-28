import * as React from 'react';
import { connect } from 'react-redux';
import { GameForm } from '../../components/forms/GameForm';
import { ReduxState } from '../../services/rootReducer';
import { PlayersService } from '../../services/players';
import { Player } from '../../../server/model/Player';
import { SpinnerOverlay } from '../../components/spinnerOverlay/SpinnerOverlay';
import { Game } from '../../../server/model/Game';
import { SagaContextType, SagaRegistration, getSagaContext } from '../../sagaProvider';
import { SagaListener } from '../../services/sagaListener';
import { saveGameActions, SaveGameService } from '../../services/saveGame/index';
import { Palantoaster, TIntent } from '../../components/toaster/Toaster';
import { DispatchContext, DispatchersContextType } from '../../dispatchProvider';
import { mergeContexts } from '../../app';
import { Dispatchers } from '../../services/dispatchers';
import { StaticRoutes } from '../../routes';
import { RecentGamesService } from '../../services/recentGames/index';
import history from '../../history';

interface StateProps {
  players: PlayersService;
  saveGame: SaveGameService;
  recentGames: RecentGamesService;
}

type Props = StateProps;

export class Internal extends React.PureComponent<Props, {}> {
  public static contextTypes = mergeContexts(SagaContextType, DispatchersContextType);
  private sagas: SagaRegistration;
  private gameSavedListener: SagaListener<{ result: void }> = {
    actionType: saveGameActions.success,
    callback: () => {
      Palantoaster.show({
        message: 'Game Saved Succesufully',
        intent: TIntent.SUCCESS,
      });
      history.push(StaticRoutes.recent());
    },
  };
  private gameSaveErrorListener: SagaListener<{ error: Error }> = {
    actionType: saveGameActions.error,
    callback: () => {
      Palantoaster.show({
        message: 'Server Error: Game was not saved correctly.',
        intent: TIntent.DANGER,
      });
    },
  };
  private dispatchers: Dispatchers;

  constructor(props: Props, context: DispatchContext) {
    super(props, context);
    this.sagas = getSagaContext(context);
    this.dispatchers = context.dispatchers;
  }

  public componentWillMount() {
    this.sagas.register(this.gameSavedListener);
    this.sagas.register(this.gameSaveErrorListener);
    this.dispatchers.players.request(undefined);
    this.dispatchers.recentGames.request({ count: 10, full: true });
  }

  public componentWillUnmount() {
    this.sagas.unregister(this.gameSavedListener);
    this.sagas.unregister(this.gameSaveErrorListener);
  }

  private getPlayerList(players: Map<string, Player>) {
    const list = Array.from(players.values());
    return list.sort((p1: Player, p2: Player) => {
      const n1 = `${p1.firstName}${p1.lastName}`;
      const n2 = `${p2.firstName}${p2.lastName}`;
      return n1.localeCompare(n2);
    });
  }

  private getRecentPlayerList(players: Map<string, Player>, recentGames: Game[]): Player[] | undefined {
    if (recentGames.length >= 2) {
      const playerSet = new Set<string>();
      recentGames
        .map((game) => this.getPlayersInGame(game))
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
  }

  private getPlayersInGame(game: Game): string[] {
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

  public render() {
    return (
      <div className='enter-container page-container'>
        <div className='title'>
          <h1>Enter Score</h1>
        </div>
        {this.renderContainer()}
      </div>
    );
  }

  private renderContainer() {
    const players = this.props.players;
    const saveGame = this.props.saveGame;
    const recentGames = this.props.recentGames;
    if (players.loading || saveGame.loading || recentGames.loading) {
      return <SpinnerOverlay size='pt-large'/>;
    } else if (players.value && recentGames.value) {
      return this.renderPage(players.value, recentGames.value);
    } else if (players.error) {
      return <p>Error loading players: {this.props.players.error}</p>;
    } else if (recentGames.error) {
      return <p>Error loading recent games: {this.props.recentGames.error}</p>;
    } else {
      return <p>Something went wrong...</p>;
    }
  }

  private renderPage(players: Map<string, Player>, recentGames: Game[]) {
    const recentPlayers = this.getRecentPlayerList(players, recentGames);
    let playerList = this.getPlayerList(players);
    return (
      <GameForm
        recentPlayers={recentPlayers}
        players={playerList}
        submitText='Enter Score'
        onSubmit={this.onSubmit}
      />
    );
  }

  private onSubmit = (newGame: Game) => {
    this.dispatchers.saveGame.request(newGame);
  }
}

const mapStateToProps = (state: ReduxState): StateProps => {
  return {
    players: state.players,
    saveGame: state.saveGame,
    recentGames: state.recentGames,
  }
}

export const EnterContainer = connect(mapStateToProps)(Internal);
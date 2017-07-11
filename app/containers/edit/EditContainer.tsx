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
import { GameService } from '../../services/game';
import { Routes } from '../../routes';

interface OwnProps {
  params: {
    gameId: string;
  };
}

interface StateProps {
  games: GameService;
  players: PlayersService;
  saveGame: SaveGameService;
}

type Props = OwnProps & StateProps;

export class Internal extends React.PureComponent<Props, void> {
  public static contextTypes = mergeContexts(SagaContextType, DispatchersContextType);
  private sagas: SagaRegistration;
  private gameSavedListener: SagaListener<Game> = {
    actionType: saveGameActions.SUCCESS,
    callback: () => {
      Palantoaster.show({
        message: 'Game ' + this.props.params.gameId + ' Updated Succesfully',
        intent: TIntent.SUCCESS,
      });
      this.dispatchers.navigation.push(Routes.game(this.props.params.gameId));
    },
  };
  private gameSaveErrorListener: SagaListener<Game> = {
    actionType: saveGameActions.ERROR,
    callback: () => {
      Palantoaster.show({
        message: 'Server Error: Game was not updated correctly.',
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
    this.dispatchers.games.requestSingle(this.props.params.gameId);
  }

  public componentWillUnmount() {
    this.sagas.unregister(this.gameSavedListener);
    this.sagas.unregister(this.gameSaveErrorListener);
  }

  private getPlayerList() {
    if (this.props.players.value) {
      const list = Array.from(this.props.players.value.values());
      return list.sort((p1: Player, p2: Player) => {
        const n1 = `${p1.firstName}${p1.lastName}`;
        const n2 = `${p2.firstName}${p2.lastName}`;
        return n1.localeCompare(n2);
      });
    }
  }

  public render() {
    return (
      <div className='enter-container pt-ui-text-large'>
        <div className='title'>
          <h1>Edit Game {this.props.params.gameId}</h1>
        </div>
        {this.renderContainer()}
      </div>
    );
  }

  private renderContainer() {
    const players = this.props.players;
    const game = this.props.games.get(this.props.params.gameId);
    const saveGame = this.props.saveGame;
    if (players.loading || game.loading || saveGame.loading) {
      return <SpinnerOverlay size='pt-large'/>;
    } else if (players.value && game.value) {
      return (
        <GameForm
          game={game.value}
          players={this.getPlayerList()!}
          submitText='Update Game'
          onSubmit={this.onSubmit}
        />
      );
    } else if (players.error) {
      return <p>Error loading players: {this.props.players.error}</p>;
    } else {
      return <p>Something went wrong...</p>;
    }
  }

  private onSubmit = (newGame: Game) => {
    // TODO: compare and block requests when there are no edits?
    this.dispatchers.saveGame.request(newGame);
  }
}

const mapStateToProps = (state: ReduxState, ownProps?: OwnProps): OwnProps & StateProps => {
  return {
    ...ownProps,
    games: state.games,
    players: state.players,
    saveGame: state.saveGame,
  };
}

export const EditContainer = connect(mapStateToProps)(Internal);
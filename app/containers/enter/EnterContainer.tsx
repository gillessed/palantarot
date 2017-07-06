import * as React from 'react';
import { connect } from 'react-redux';
import { GameForm } from '../../components/forms/GameForm';
import { ReduxState } from '../../services/rootReducer';
import { PlayersService } from '../../services/players';
import { Player } from '../../../server/model/Player';
import { SpinnerOverlay } from '../../components/spinnerOverlay/SpinnerOverlay';
import { saveGameActionCreators } from '../../services/saveGame/index';
import { Game } from '../../../server/model/Game';
import { SagaContextType, SagaRegistration, getSagaContext } from '../../sagaProvider';
import { SagaListener } from '../../services/sagaListener';
import { saveGameActions } from '../../services/saveGame/index';
import { Palantoaster, TIntent } from '../../components/toaster/Toaster';
import { DispatchContext, DispatchersContextType } from '../../dispatchProvider';
import { mergeContexts } from '../../app';
import { Dispatchers } from '../../services/dispatchers';

interface StateProps {
  players: PlayersService;
}

interface DispatchProps {
  saveGame: (newGame: Game) => void;
}

type Props = StateProps & DispatchProps;

interface State {
  numberOfPlayers: 5,
  bidder?: Player;
  calledSelf: boolean;
  bidAmount?: number;
  points?: number;
  partner?: Player;
  opposition: Array<Player | undefined>;
}

export class Internal extends React.PureComponent<Props, State> {
  public static contextTypes = mergeContexts(SagaContextType, DispatchersContextType);
  private sagas: SagaRegistration;
  private gameSavedListener: SagaListener<Game> = {
    actionType: saveGameActions.SUCCESS,
    callback: () => {
      Palantoaster.show({
        message: 'Game Saved Succesufully',
        intent: TIntent.SUCCESS,
      });
      this.dispatchers.navigation.push('/recent');
    },
  };
  private gameSaveErrorListener: SagaListener<Game> = {
    actionType: saveGameActions.ERROR,
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
    this.state = {
      numberOfPlayers: 5,
      calledSelf: false,
      opposition: [undefined, undefined, undefined],
    };
  }

  public componentWillMount() {
    this.sagas.register(this.gameSavedListener);
    this.sagas.register(this.gameSaveErrorListener);
    this.dispatchers.players.request(undefined);
  }

  public componentWillUnmount() {
    this.sagas.unregister(this.gameSavedListener);
    this.sagas.unregister(this.gameSavedListener);
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
          <h1>Enter Score</h1>
        </div>
        {this.renderContainer()}
      </div>
    );
  }

  private renderContainer() {
    const players = this.props.players;
    if (players.loading) {
      return <SpinnerOverlay size='pt-large'/>;
    } else if (players.value) {
      return (
        <GameForm
          players={this.getPlayerList()!}
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
    this.props.saveGame(newGame);
  }
}

const mapStateToProps = (state: ReduxState): StateProps => {
  return {
    players: state.players,
  }
}

const mapDispatchToProps = (dispatch: any): DispatchProps => {
  return {
    saveGame: (newGame: Game) => { dispatch(saveGameActionCreators.request(newGame)); },
  }
}

export const EnterContainer = connect(mapStateToProps, mapDispatchToProps)(Internal);
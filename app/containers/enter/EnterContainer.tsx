import * as React from 'react';
import { connect } from 'react-redux';
import { GameForm } from '../../components/forms/GameForm';
import { ReduxState } from '../../services/rootReducer';
import { playersActionCreators, PlayersService } from '../../services/players';
import { Player } from '../../../server/model/Player';
import { SpinnerOverlay } from '../../components/spinnerOverlay/SpinnerOverlay';
import { saveGameActionCreators } from '../../services/saveGame/index';
import { Game } from '../../../server/model/Game';

interface StateProps {
  players: PlayersService;
}

interface DispatchProps {
  loadPlayers: () => void;
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

  constructor(props: Props) {
    super(props);
    this.state = {
      numberOfPlayers: 5,
      calledSelf: false,
      opposition: [undefined, undefined, undefined],
    };
  }

  public componentWillMount() {
    this.props.loadPlayers();
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
    loadPlayers: () => { dispatch(playersActionCreators.request(undefined)); },
    saveGame: (newGame: Game) => { dispatch(saveGameActionCreators.request(newGame)); }
  }
}

export const EnterContainer = connect(mapStateToProps, mapDispatchToProps)(Internal);
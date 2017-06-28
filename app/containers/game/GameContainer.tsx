import * as React from 'react';
import { connect } from 'react-redux';
import { ReduxState } from '../../services/rootReducer';
import { Player } from '../../../server/model/Player';
import { PlayerHand } from '../../../server/model/Game';
import { playersActionCreators, PlayersService } from '../../services/players';
import { gameActionCreators, GameService } from '../../services/game';
import { SpinnerOverlay } from '../../components/spinnerOverlay/SpinnerOverlay';
import { push } from 'react-router-redux'

interface OwnProps {
  children: any[];
  params: {
    gameId: string;
  };
}

interface StateProps {
  players: PlayersService;
  games: GameService;
}

interface DispatchProps {
  loadPlayers: () => void;
  loadGame: (gameId: string) => void
  push: (path: string) => void;
}

type Props = OwnProps & StateProps & DispatchProps;

interface State {
  page: number,
}

class Internal extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      page: 0,
    };
  }

  public componentWillMount() {
    this.props.loadPlayers();
    this.props.loadGame(this.props.params.gameId);
  }

  public render() {
    return (
      <div className='game-container pt-ui-text-large'>
        <div className='title'>
          <h1>Game {this.props.params.gameId}</h1>
        </div>
        {this.renderContainer()}
      </div>
    );
  }

  private renderContainer() {
    const players = this.props.players;
    const game = this.props.games.get(this.props.params.gameId);
    if (players.loading || game.loading) {
      return <SpinnerOverlay size='pt-large'/>;
    } else if (players.value && game.value) {
      return this.renderGame();
    } else if (players.error) {
      return <p>Error loading players: {this.props.players.error}</p>;
    } else if (game.error) {
      return <p>Error loading game: {game.error.message}</p>;
    } else {
      return <p>Something went wrong...</p>;
    }
  }

  private renderGame = () => {
    const players = this.props.players.value!;
    const game = this.props.games.get(this.props.params.gameId).value!;

    if (game.handData) {
      return (
        <div>
          <p>Number of players: {game.numberOfPlayers}</p>
          <p>Slam: {game.slam ? 'Yes': 'No'}</p>
          <br/>
          {this.renderHandData(players, 'Bidder', game.handData.bidder)}
          {this.renderHandData(players, 'Partner', game.handData.partner)}
          {game.handData.opposition.map((handData: PlayerHand, index: number) => {
            return this.renderHandData(players, `Opposition ${index + 1}`, handData);
          })}
        </div>
      );
    } else {
      return <p>Hand data not loaded...</p>;
    }
  }

  private renderHandData = (
    players: Map<string, Player>,
    tag: string,
    handData?: PlayerHand
  ) => {
    if (handData) {
      const bidder = players.get(handData.id);
      const bidderName = bidder ? `${bidder.firstName} ${bidder.lastName}` : `Unknown Player: ${handData.id}`;
      return (
        <p key={handData.id}><span className='text' style={{fontWeight: 'bold'}}>{tag}: </span> {bidderName}</p>
      );
    }
  }
}

const mapStateToProps = (state: ReduxState, ownProps?: OwnProps): OwnProps & StateProps => {
  return {
    ...ownProps,
    players: state.players,
    games: state.games,
  }
}

const mapDispatchToProps = (dispatch: any): DispatchProps => {
  return {
    loadPlayers: () => { dispatch(playersActionCreators.request(undefined)); },
    loadGame: (gameId: string) => { dispatch(gameActionCreators.request([gameId])); },
    push: (path: string) => { dispatch(push(path)); },
  }
}

export const GameContainer = connect(mapStateToProps, mapDispatchToProps)(Internal);
import * as React from 'react';
import { connect } from 'react-redux';
import { ReduxState } from '../../services/rootReducer';
import { Game } from '../../../server/model/Game';
import { playersActionCreators, PlayersService } from '../../services/players';
import { recentGamesActionCreators, RecentGamesService } from '../../services/recentGames';
import { SpinnerOverlay } from '../../components/spinnerOverlay/SpinnerOverlay';
import { GameTable } from '../../components/gameTable/GameTable';
import { push } from 'react-router-redux';

interface OwnProps {
  children: any[];
}

interface StateProps {
  players: PlayersService;
  recentGames: RecentGamesService;
}

interface DispatchProps {
  loadPlayers: () => void;
  loadRecentGames: () => void;
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
    this.props.loadRecentGames();
  }

  public render() {
    return (
      <div className='recent-container pt-ui-text-large'>
        <div className='title'>
          <h1>Recent Games</h1>
        </div>
        <p className='pt-running-text'>Click on a game to view more details.</p>
        {this.renderGames()}
      </div>
    );
  }

  private renderGames() {
    if (this.props.players.loading || this.props.recentGames.loading) {
      return <SpinnerOverlay size='pt-large'/>;
    } else if (this.props.players.value && this.props.recentGames.value) {
      return (
        <GameTable
          games={this.props.recentGames.value}
          players={this.props.players.value}
          onRowClick={this.onRowClick}
        />
      );
    } else if (this.props.players.error) {
      return <p>Error loading players: {this.props.players.error}</p>;
    } else if (this.props.recentGames.error) {
      return <p>Error loading recent games: {this.props.recentGames.error}</p>;
    } else {
      return <p>Something went wrong...</p>;
    }
  }

  private onRowClick = (game: Game) => {
    this.props.push(`/game/${game.id}`);
  }
}

const mapStateToProps = (state: ReduxState, ownProps?: OwnProps): OwnProps & StateProps => {
  return {
    ...ownProps,
    players: state.players,
    recentGames: state.recentGames,
  }
}

const mapDispatchToProps = (dispatch: any): DispatchProps => {
  return {
    loadPlayers: () => { dispatch(playersActionCreators.request(undefined)); },
    loadRecentGames: () => { dispatch(recentGamesActionCreators.request(undefined)); },
    push: (path: string) => { dispatch(push(path)); },
  }
}

export const RecentContainer = connect(mapStateToProps, mapDispatchToProps)(Internal);
import * as React from 'react';
import { connect } from 'react-redux';
import { ReduxState } from '../../services/rootReducer';
import { PlayersService } from '../../services/players';
import { RecentGamesService } from '../../services/recentGames';
import { SpinnerOverlay } from '../../components/spinnerOverlay/SpinnerOverlay';
import { GameTable } from '../../components/gameTable/GameTable';
import { DispatchersContextType, DispatchContext } from '../../dispatchProvider';
import { Dispatchers } from '../../services/dispatchers';

interface OwnProps {
  children: any[];
}

interface StateProps {
  players: PlayersService;
  recentGames: RecentGamesService;
}

type Props = OwnProps & StateProps;

interface State {
  page: number,
}

class Internal extends React.PureComponent<Props, State> {
  public static contextTypes = DispatchersContextType;
  private dispatchers: Dispatchers;
  
  constructor(props: Props, context: DispatchContext) {
    super(props, context);
    this.dispatchers = context.dispatchers;
    this.state = {
      page: 0,
    };
  }

  public componentWillMount() {
    this.dispatchers.players.request(undefined);
    this.dispatchers.recentGames.request({ count: 20 });
  }

  public render() {
    return (
      <div className='recent-container page-container pt-ui-text-large'>
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
        <div className='recent-table-container table-container'>
          <GameTable
            games={this.props.recentGames.value}
            players={this.props.players.value}
            navigationDispatcher={this.dispatchers.navigation}
          />
        </div>
      );
    } else if (this.props.players.error) {
      return <p>Error loading players: {this.props.players.error}</p>;
    } else if (this.props.recentGames.error) {
      return <p>Error loading recent games: {this.props.recentGames.error}</p>;
    } else {
      return <p>Something went wrong...</p>;
    }
  }
}

const mapStateToProps = (state: ReduxState, ownProps?: OwnProps): OwnProps & StateProps => {
  return {
    ...ownProps,
    players: state.players,
    recentGames: state.recentGames,
  }
}

export const RecentContainer = connect(mapStateToProps)(Internal);
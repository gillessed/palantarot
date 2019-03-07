import * as React from 'react';
import { connect } from 'react-redux';
import { ReduxState } from '../../services/rootReducer';
import { PlayersService } from '../../services/players';
import { DispatchersContextType, DispatchContext } from '../../dispatchProvider';
import { Dispatchers } from '../../services/dispatchers';


interface Props {
  players: PlayersService;
}

class Internal extends React.PureComponent<Props, {}> {
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
      <div className='search-container page-container'>
        <div className='title'>
          <h1 className='bp3-heading'>Search</h1>
        </div>
        <p className='pt-running-text'>Under construction...</p>
      </div>
    );
  }
}

const mapStateToProps = (state: ReduxState): Props => {
  return {
    players: state.players,
  }
}

export const SearchContainer = connect(mapStateToProps)(Internal);
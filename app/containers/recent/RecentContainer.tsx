import * as React from 'react';
import { RecentGameQuery } from '../../../server/db/GameQuerier';
import { Game } from '../../../server/model/Game';
import { Player } from '../../../server/model/Player';
import { BidderWonValidator, DEFAULT_COUNT, GameTable } from '../../components/gameTable/GameTable';
import { playersLoader } from '../../services/players/index';
import { recentGamesLoader } from '../../services/recentGames/index';
import { loadContainer } from '../LoadingContainer';

interface Props {
  players: Map<string, Player>;
  recentGames: Game[];
  offset: number;
  onOffsetChange: (offset: number) => void;
}

class RecentContainerInternal extends React.PureComponent<Props, {}> {
  public render() {
    const pageState = {
      offset: this.props.offset,
      onOffsetChange: this.props.onOffsetChange,
    }; 
    return (
      <div className='recent-container page-container pt-ui-text-large'>
        <div className='title'>
          <h1 className='bp3-heading'>Recent Games</h1>
        </div>
        <div className='recent-table-container table-container'>
          <GameTable
            games={this.props.recentGames}
            players={this.props.players}
            winLossValidator={BidderWonValidator}
            pageState={pageState}
          />
        </div>
      </div>
    );
  }
}

const RecentContainerLoader = loadContainer({
  players: playersLoader,
  recentGames: recentGamesLoader,
})(RecentContainerInternal);

interface State {
  offset: number;
  query: RecentGameQuery;
}

export class RecentContainer extends React.PureComponent<{}, State> {
  constructor(props: {}) {
    super(props);
    this.state = {
      offset: 0,
      query: { count: DEFAULT_COUNT },
    };
  }

  public render() {
    return (
      <RecentContainerLoader
        recentGames={this.state.query}
        onOffsetChange={this.onOffsetChange}
        offset={this.state.offset}
      />
    )
  }

  private onOffsetChange = (offset: number) => {
    let query: RecentGameQuery;
    if (offset === 0) {
      query = { count: DEFAULT_COUNT };
    } else {
      query = { count: DEFAULT_COUNT, offset: DEFAULT_COUNT * offset };
    }
    this.setState({ query, offset });
  }
}

import * as React from 'react';
import { GameRecord } from '../../../server/model/GameRecord';
import { Player } from '../../../server/model/Player';
import { SearchQuery } from '../../../server/model/Search';
import { BidderWonValidator, DEFAULT_COUNT, GameTable } from '../../components/gameTable/GameTable';
import { playersLoader } from '../../services/players/index';
import { searchLoader } from '../../services/search/index';
import { loadContainer } from '../LoadingContainer';

interface Props {
  players: Map<string, Player>;
  search: GameRecord[];
}

interface State {
  offset: number;
}

class SearchResultsContainerInternal extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      offset: 0,
    };
  }

  public render() {
    const pageState = {
      offset: this.state.offset,
      onOffsetChange: this.onOffsetChange,
    };
    const offsetStart = this.state.offset * DEFAULT_COUNT;
    const offsetEnd = offsetStart + DEFAULT_COUNT;
    const gamesSlice = this.props.search.slice(offsetStart, offsetEnd);
    return (
      <div className='seach-results-container page-container pt-ui-text-large'>
        <div className='title'>
          <h1 className='bp3-heading'>Search Results</h1>
          {this.props.search.length > 0 &&
            <h6 className='bp3-heading'>Showing {offsetStart + 1} to {offsetEnd} of {this.props.search.length} games. </h6>
          }
        </div>
        <div className='recent-table-container table-container'>
          <GameTable
            games={gamesSlice}
            players={this.props.players}
            winLossValidator={BidderWonValidator}
            pageState={pageState}
          />
        </div>
      </div>
    );
  }

  private onOffsetChange = (offset: number) => {
    this.setState({ offset: offset });
  }
}

const SearchResultsContainerLoader = loadContainer({
  players: playersLoader,
  search: searchLoader,
})(SearchResultsContainerInternal);

interface Props {
  location?: {
    state: SearchQuery;
  }
}

export class SearchResultsContainer extends React.PureComponent<Props, State> {

  public render() {
    if (!this.props.location) {
      return null;
    }
    return (
      <SearchResultsContainerLoader
        search={this.props.location.state}
      />
    );
  }
}

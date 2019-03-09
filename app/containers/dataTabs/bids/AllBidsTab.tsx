import * as React from 'react';
import { Player } from '../../../../server/model/Player';
import { BidsGraph } from './BidsGraph';
import { PlayerSelectContainer } from '../../../components/forms/PlayerSelect';
import { BidRequest } from '../../../../server/model/Bid';

interface State {
  filterPlayer?: Player;
}

export class AllBidsTab extends React.PureComponent<{}, State> {

  constructor(props: {}) {
    super(props);
    this.state = {};
  }

  public render() {
    return (
      <div className='bids-table-container table-container'>
        <PlayerSelectContainer
          unselectedLabel='All Players'
          onPlayerSelected={this.onPlayerSelected}
        />
        {this.renderGraph()}
      </div>
    );
  }

  private renderGraph() {
    const player = this.state.filterPlayer;
    let title: string;
    if (player) {
      title = `${player.firstName} ${player.lastName}'s Bid Breakdown `;
    } else {
      title = 'All Bids';
    }
    const request: BidRequest = {
      playerId: player ? player.id : undefined,
    }
    return (
      <div>
        <h3 className='bp3-heading'> {title} </h3>
        <BidsGraph bids={request} />
      </div>
    );
  }

  private onPlayerSelected = (player?: Player) => {
    this.setState({ filterPlayer: player });
  }
}

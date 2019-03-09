import * as React from 'react';
import { Player } from '../../../../server/model/Player';
import { BidRequest } from '../../../../server/model/Bid';
import { BidsGraph } from './BidsGraph';
import { loadContainer } from '../../LoadingContainer';
import { playersLoader } from '../../../services/players/index';

interface Props {
  playerId: string;
  players: Map<string, Player>;
}

class PlayerBidsTabInternal extends React.PureComponent<Props, {}> {
  public render() {
    return (
      <div className='bids-table-container table-container'>
        {this.renderGraph()}
      </div>
    );
  }

  private renderGraph() {
    const player = this.props.players.get(this.props.playerId)!;
    const title = `${player.firstName} ${player.lastName}'s Bid Breakdown `;
    const request: BidRequest = {
      playerId: this.props.playerId,
    };
    return (
      <div>
        <h3 className='bp3-heading'> {title} </h3>
        <BidsGraph bids={request} />
      </div>
    );
  }
}

export const PlayerBidsTab = loadContainer({
  players: playersLoader,
})(PlayerBidsTabInternal);

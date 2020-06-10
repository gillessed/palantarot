import * as React from 'react';
import { BidRequest } from '../../../../server/model/Bid';
import { Player } from '../../../../server/model/Player';
import { playersLoader } from '../../../services/players/index';
import { getPlayerName } from '../../../services/players/playerName';
import { loadContainer } from '../../LoadingContainer';
import { BidsGraph } from './BidsGraph';

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
    const title = `${getPlayerName(player)}'s Bid Breakdown `;
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

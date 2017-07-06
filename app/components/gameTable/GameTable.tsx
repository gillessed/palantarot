import * as React from 'react';
import { Player } from '../../../server/model/Player';
import { Game } from '../../../server/model/Game';
import { formatTimestamp } from '../../../server/utils/index';

class Props {
  players: Map<string, Player>;
  games: Game[];
  onRowClick: (game: Game) => void;
}

export class GameTable extends React.PureComponent<Props, {}> {

  public render() {
    return (
      <table className='game-table pt-table pt-bordered pt-interactive'>
        <thead>
          <tr>
            <th>Bidder</th>
            <th>Partner</th>
            <th>Bid</th>
            <th>Points</th>
            <th>Players</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          {this.props.games.map(this.renderGameTableRow)}
        </tbody>
      </table>
    );
  }

  private renderGameTableRow = (game: Game) => {
    const bidder = this.props.players.get(game.bidderId);
    const bidderName = bidder ? `${bidder.firstName} ${bidder.lastName}` : `Unknown Player: ${game.bidderId}`;
    let partnerName = '';
    if (game.partnerId) {
      const partner = this.props.players.get(game.partnerId);
      partnerName = partner ? `${partner.firstName} ${partner.lastName}` : `Unknown Player: ${game.partnerId}`;
    }
    return (
      <tr key={game.id} onClick={() => this.props.onRowClick(game)}>
        <td>{bidderName}</td>
        <td>{partnerName}</td>
        <td>{game.bidAmount}</td>
        <td>{game.points}</td>
        <td>{game.numberOfPlayers}</td>
        <td>{formatTimestamp(game.timestamp)}</td>
      </tr>
    );
  }
}
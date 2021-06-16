import classNames from 'classnames';
import * as React from 'react';
import { GameRecord } from '../../../server/model/GameRecord';
import { Player } from '../../../server/model/Player';
import { formatTimestamp } from '../../../server/utils/index';
import history from '../../history';
import { DynamicRoutes } from '../../routes';
import { GameOutcome } from './GameTable';

interface Props {
  players: Map<string, Player>;
  game: GameRecord;
  outcome: GameOutcome;
}

export class GameTableRow extends React.PureComponent<Props, {}> {
    public render() {
      const game = this.props.game;
      const bidder = this.props.players.get(game.bidderId);
      const bidderName = bidder ? `${bidder.firstName} ${bidder.lastName}` : `Unknown Player: ${game.bidderId}`;
      let partnerName = '';
      if (game.partnerId) {
        const partner = this.props.players.get(game.partnerId);
        partnerName = partner ? `${partner.firstName} ${partner.lastName}` : `Unknown Player: ${game.partnerId}`;
      }
      const classes = classNames({
        ['outcome-unknown']: this.props.outcome === GameOutcome.UNKNOWN,
        ['outcome-win']: this.props.outcome === GameOutcome.WIN,
        ['outcome-loss']: this.props.outcome === GameOutcome.LOSS,
      });
      return (
        <tr
          onClick={this.onClick}
          className={classes}
        >
          <td>{bidderName}</td>
          <td>{partnerName}</td>
          <td>{game.bidAmount}</td>
          <td>{game.points}</td>
          <td>{game.numberOfPlayers}</td>
          <td>{formatTimestamp(game.timestamp)}</td>
        </tr>
      );
    }

    private onClick = () => {
      history.push(DynamicRoutes.game(this.props.game.id))
    }
  }

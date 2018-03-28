import * as React from 'react';
import { Player } from '../../../server/model/Player';
import { Game } from '../../../server/model/Game';
import { GameOutcome } from './GameTable';
import { DynamicRoutes } from '../../routes';
import { formatTimestamp } from '../../../server/utils/index';
import classNames from 'classnames';
import history from '../../history';

interface Props {
  players: Map<string, Player>;
  game: Game;
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
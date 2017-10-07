import * as React from 'react';
import { Player } from '../../../server/model/Player';
import { Game } from '../../../server/model/Game';
import { NavigationDispatcher } from '../../services/navigation/index';
import { GameTableRow } from './GameTableRow';

export enum GameOutcome {
  WIN,
  LOSS,
  UNKNOWN,
}

export const BidderWonValidator = (game: Game) => {
  if (game.points >= 0) {
    return GameOutcome.WIN;
  } else {
    return GameOutcome.LOSS;
  }
}

class Props {
  players: Map<string, Player>;
  games: Game[];
  navigationDispatcher: NavigationDispatcher;
  winLossValidator?: (game: Game) => GameOutcome;
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
    let outcome = GameOutcome.UNKNOWN;
    if (this.props.winLossValidator) {
      outcome = this.props.winLossValidator(game);
    }
    return (
      <GameTableRow
        key={game.id}
        players={this.props.players}
        game={game}
        navigationDispatcher={this.props.navigationDispatcher}
        outcome={outcome}
      />
    );
  }
}
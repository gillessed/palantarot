import * as React from 'react';
import { Player } from '../../../server/model/Player';
import { Result } from '../../../server/model/Result';
import { NavigationDispatcher } from '../../services/navigation/index';
import { DynamicRoutes } from '../../routes';

class Props {
  players: Map<string, Player>;
  results: Result[];
  navigationDispatcher: NavigationDispatcher;
  renderDelta?: boolean;
}

export class ScoreTable extends React.PureComponent<Props, {}> {

  public render() {
    return (
      <div className='score-table-container'>
        <table className='score-table pt-table pt-bordered pt-interactive'>
          <thead>
            <tr>
              <th></th>
              <th>Player</th>
              <th>Total Score</th>
              <th>#</th>
              <th>Avg</th>
            </tr>
          </thead>
          <tbody>
            {this.props.results.map(this.renderResultRow)}
          </tbody>
        </table>
      </div>
    );
  }

  private renderResultRow = (result: Result, index: number) => {
    const player = this.props.players.get(result.id);
    const playerName = Player.getName(result.id, player);
    const onRowClick = () => {
      if (player) {
        this.props.navigationDispatcher.push(DynamicRoutes.player(player.id));
      }
    }
    return (
      <tr key={result.id} onClick={onRowClick}>
        <td className='rank-row'>{index + 1}</td>
        <td>{playerName}</td>
        <td>{result.points} {this.renderDelta(result.delta)}</td>
        <td>{result.gamesPlayed}</td>
        <td>{(result.points / result.gamesPlayed).toFixed(2)}</td>
      </tr>
    );
  }

  private renderDelta = (delta?: number) => {
    if (!this.props.renderDelta || !delta) {
      return '';
    }
    if (delta < 0) {
      return (
        <span className='score-delta' style={{color: 'red'}}>
          <span className='pt-icon pt-icon-arrow-down'></span>
          {delta}
        </span>
      );
    } else {
    if (delta > 0) {
      return (
        <span className='score-delta' style={{color: 'green'}}>
          <span className='pt-icon pt-icon-arrow-up'></span>
          {delta}
        </span>
      );
    }}
  }
}
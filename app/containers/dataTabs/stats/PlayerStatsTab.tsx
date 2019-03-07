import * as React from 'react';
import { Player } from '../../../../server/model/Player';
import { StatsService } from '../../../services/stats/index';
import { SpinnerOverlay } from '../../../components/spinnerOverlay/SpinnerOverlay';
import { AggregatedStats, AggregatedStat, StatAverage, getAverages } from '../../../../server/model/Stats';
import { IMonth } from '../../../../server/model/Month';
import { PlayerStatsTableRow } from '../winPercentages/PlayerStatsTableRow';
import { chop } from '../../../../server/utils/index';

interface Props {
  player: Player;
  stats: StatsService;
}

export class PlayerStatsTab extends React.PureComponent<Props, {}> {

  public render() {
    const stats = this.props.stats;
    if (stats.loading) {
      return <SpinnerOverlay size='pt-large'/>;
    } else if (stats.value) {
      return this.renderContainer(stats.value);
    } else if (stats.error) {
      return <p>Error loading stats: {stats.error.message}</p>;
    } else {
      return <p>Something went wrong...</p>;
    }
  }

  public renderContainer(stats: AggregatedStats) {
    const playerStats = stats
      .filter((stat) => stat.playerId === this.props.player.id)
      .sort(IMonth.comparator((stat: AggregatedStat) => stat.month, 'desc'));
    const averages = getAverages(playerStats);

    return (
      <div className='table-container'>
        <table className='player-stats-table pt-html-table pt-html-table-bordered'>
          <thead>
            <tr>
              <th>Role</th>
              <th colSpan={2}>All Roles</th>
              <th colSpan={3}>Bidder</th>
              <th colSpan={3}>Partner</th>
              <th colSpan={3}>Opposition</th>
            </tr>
            <tr>
              <th>Month</th>
              <th>Win %</th>
              <th>Avg Points</th>
              <th>Rate</th>
              <th>Win %</th>
              <th>Avg Points</th>
              <th>Rate</th>
              <th>Win %</th>
              <th>Avg Points</th>
              <th>Rate</th>
              <th>Win %</th>
              <th>Avg Points</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className='averages'>Averages</td>
              {this.renderAveragePer(averages.allRoles)}
              {this.renderAverageWin(averages.allRoles)}
              {this.renderStatRate(averages.bidder)}
              {this.renderAveragePer(averages.bidder)}
              {this.renderAverageWin(averages.bidder)}
              {this.renderStatRate(averages.partner)}
              {this.renderAveragePer(averages.partner)}
              {this.renderAverageWin(averages.partner)}
              {this.renderStatRate(averages.opposition)}
              {this.renderAveragePer(averages.opposition)}
              {this.renderAverageWin(averages.opposition)}
            </tr>
            {playerStats.map((stat) => 
              <PlayerStatsTableRow
                stat={stat}
                averages={averages}
                key={stat.month.getHumanReadableString()}
              />)}
          </tbody>
        </table>
      </div>
    );
  }

  private renderAveragePer(average?: StatAverage) {
    if (average && average.per !== undefined) {
      return <td>{chop(average.per * 100, 1)}%</td>;
    } else {
      return <td className='not-applicable'>N/A</td>;
    }
  }
  
  private renderAverageWin(average?: StatAverage) {
    if (average && average.win !== undefined) {
      return <td>+{chop(average.win, 1)}</td>;
    } else {
      return <td className='not-applicable'>N/A</td>;
    }
  }
  
  private renderStatRate(average?: StatAverage) {
    if (average && average.rate !== undefined) {
      return <td>{chop(average.rate * 100, 1)}%</td>;
    } else {
      return <td className='not-applicable'>N/A</td>;
    }
  }
}
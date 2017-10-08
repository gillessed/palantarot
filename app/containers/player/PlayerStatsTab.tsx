import * as React from 'react';
import { Player } from '../../../server/model/Player';
import { StatsService } from '../../services/stats/index';
import { SpinnerOverlay } from '../../components/spinnerOverlay/SpinnerOverlay';
import { AggregatedStats, AggregatedStat, StatAverages, StatAverage, RoleStats } from '../../../server/model/Stats';
import { IMonth } from '../../../server/model/Month';
import { PlayerStatsTableRow } from './PlayerStatsTableRow';
import { chop } from '../../../server/utils/index';

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
    const averages = this.getAverages(playerStats);

    return (
      <table className='player-stats-table pt-table pt-bordered'>
        <thead>
          <tr>
            <th>Role</th>
            <th colSpan={2}>All Roles</th>
            <th colSpan={2}>Bidder</th>
            <th colSpan={2}>Partner</th>
            <th colSpan={2}>Opposition</th>
          </tr>
          <tr>
            <th>Month</th>
            <th>Win %</th>
            <th>Avg Points</th>
            <th>Win %</th>
            <th>Avg Points</th>
            <th>Win %</th>
            <th>Avg Points</th>
            <th>Win %</th>
            <th>Avg Points</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className='averages'>Averages</td>
            {this.renderAveragePer(averages.allRoles)}
            {this.renderAverageWin(averages.allRoles)}
            {this.renderAveragePer(averages.bidder)}
            {this.renderAverageWin(averages.bidder)}
            {this.renderAveragePer(averages.partner)}
            {this.renderAverageWin(averages.partner)}
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

  private getAverages(playerStats: AggregatedStats): StatAverages {
    return {
      allRoles: this.getAverage(playerStats, (stat) => stat.allStats),
      bidder: this.getAverage(playerStats, (stat) => stat.bidderStats),
      partner: this.getAverage(playerStats, (stat) => stat.partnerStats),
      opposition: this.getAverage(playerStats, (stat) => stat.oppositionStats),
    };
  }

  private getAverage(playerStats: AggregatedStats, mapper: (stats: AggregatedStat) => RoleStats): StatAverage | undefined {
    const roleStats: RoleStats[] = playerStats
      .map(mapper)
      .filter(roleStat => roleStat.totalGames > 0);
    
    if (roleStats.length === 0) {
      return undefined;
    }

    let winCount = 0;
    let totalCount = 0;
    for (const roleStat of roleStats) {
      winCount += roleStat.wonGames;
      totalCount += roleStat.totalGames;
    }
    const perMean = winCount / totalCount;

    let scoreCount = 0;
    let winScore = 0;
    for (const roleStat of roleStats) {
      scoreCount += roleStat.wonGames;
      winScore += roleStat.wonScore;
    }
    let win: number | undefined = scoreCount > 0 ? winScore / scoreCount : undefined;

    return {
      per: perMean,
      win,
    };
  }
}
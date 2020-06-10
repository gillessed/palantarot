import { Checkbox, HTMLTable } from '@blueprintjs/core';
import * as React from 'react';
import { Player } from '../../../../server/model/Player';
import { AggregatedStats, getAverages, StatEntry } from '../../../../server/model/Stats';
import { chop } from '../../../../server/utils';
import { playersLoader } from '../../../services/players/index';
import { getPlayerName } from '../../../services/players/playerName';
import { statsLoader } from '../../../services/stats/index';
import { loadContainer } from '../../LoadingContainer';
import { AllWinPercentagesTableHeader } from './AllWinPercentagesTableHeader';

interface Props {
  players: Map<string, Player>;
  stats: AggregatedStats;
}

interface State {
  filterPlayers: boolean;
  sort: number;
  order: 'asc' | 'desc';
}

type Entry = string | number | undefined;
type Row = Array<Entry>;
type Table = Array<Row>;

class AllWinPercentagesTabInternal extends React.PureComponent<Props, State> {

  private headers = [
    'Player',
    'Win %',
    'Avg',
    'Rate',
    'Win %',
    'Avg',
    'Rate',
    'Win %',
    'Avg',
    'Rate',
    'Win %',
    'Avg',
  ];

  private getStats = (): StatEntry[] => {
    const playerStats = new Map<string, AggregatedStats>();
    this.props.stats.forEach((stat) => {
      if (!playerStats.has(stat.playerId)) {
        playerStats.set(stat.playerId, []);
      }
      playerStats.get(stat.playerId)!.push(stat);
    });
    const playerAverages: StatEntry[] = [];
    playerStats.forEach((value: AggregatedStats, playerId: string) => {
      const average = getAverages(value);
      const player = this.props.players.get(playerId);
      if (average && player) {
        playerAverages.push({
          playerName: getPlayerName(player),
          stats: average,
        });
      }
    });
    return this.state.filterPlayers ?
      playerAverages.filter((entry) => {
        if (!entry.stats.allRoles) {
          return false;
        }
        return entry.stats.allRoles!.totalCount >= 100;
      })
      : playerAverages;
  }

  private tableifyStats = (stats: StatEntry[]): Table => {
    const table: Table = [];
    stats.forEach((stat) => {
      const row: Row = [];
      row.push(stat.playerName);
      if (stat.stats.allRoles) {
        row.push(stat.stats.allRoles.per);
        row.push(stat.stats.allRoles.win);
      } else {
        row.push(undefined);
        row.push(undefined);
      }
      if (stat.stats.bidder) {
        row.push(stat.stats.bidder.rate);
        row.push(stat.stats.bidder.per);
        row.push(stat.stats.bidder.win);
      } else {
        row.push(undefined);
        row.push(undefined);
        row.push(undefined);
      }
      if (stat.stats.partner) {
        row.push(stat.stats.partner.rate);
        row.push(stat.stats.partner.per);
        row.push(stat.stats.partner.win);
      } else {
        row.push(undefined);
        row.push(undefined);
        row.push(undefined);
      }
      if (stat.stats.opposition) {
        row.push(stat.stats.opposition.rate);
        row.push(stat.stats.opposition.per);
        row.push(stat.stats.opposition.win);
      } else {
        row.push(undefined);
        row.push(undefined);
        row.push(undefined);
      }
      table.push(row);
    });
    return table;
  }

  private orderedComparator = (column: number, order: 'asc' | 'desc') => {
    const mod = order === 'asc' ? 1 : -1;
    return (r1: Row, r2: Row) => {
      const e1 = r1[column];
      const e2 = r2[column];
      if ((typeof e1 === 'string') && (typeof e2 === 'string')) {
        return e1.localeCompare(e2) * mod;
      }
      if ((typeof e1 === 'number') && (typeof e2 === 'number')) {
        return (e1 - e2) * mod;
      }
      if (e1 === undefined && e2 !== undefined) {
        return 1;
      }
      if (e1 !== undefined && e2 === undefined) {
        return -1;
      }
      return 0;
    };
  }

  constructor(props: Props) {
    super(props);
    this.state = {
      filterPlayers: false,
      sort: 0,
      order: 'asc',
    };
  }

  public render() {
    const stats = this.getStats();
    const table = this.tableifyStats(stats);
    table.sort(this.orderedComparator(this.state.sort, this.state.order));

    return (
      <div className='win-percentages-container table-container'>
        {this.renderFilter()}
        <HTMLTable className='player-stats-table' bordered>
          <thead>
            <tr>
              <th></th>
              <th colSpan={2}>All Roles</th>
              <th colSpan={3}>Bidder</th>
              <th colSpan={3}>Partner</th>
              <th colSpan={3}>Opposition</th>
            </tr>
            <tr>
              {this.headers.map(this.renderHeader)}
            </tr>
          </thead>
          <tbody>
            {table.map(this.renderRow)}
          </tbody>
        </HTMLTable>
      </div>
    );
  }

  private renderHeader = (text: string, index: number) => {
    let sort: 'asc' | 'desc' | undefined;
    if (this.state.sort === index) {
      sort = this.state.order;
    }
    return (
      <AllWinPercentagesTableHeader
        key={index}
        text={text}
        index={index}
        sort={sort}
        onClick={this.onHeaderClicked}
      />
    );
  }

  private onHeaderClicked = (index: number) => {
    if (index === this.state.sort) {
      this.setState({
        order: this.state.order === 'asc' ? 'desc' : 'asc',
      });
    } else {
      this.setState({
        sort: index,
        order: 'asc',
      });
    }
  }

  private renderFilter = () => {
    return (
      <Checkbox
        checked={this.state.filterPlayers}
        label='Filter out players who have played less than 100 games: '
        onChange={this.onFilterRecordsChanged}
      />
    );
  }

  private onFilterRecordsChanged = () => {
    this.setState({
      filterPlayers: !this.state.filterPlayers,
    });
  }

  private renderRow = (row: Row) => {
    return (
      <tr key={row[0]}>
        {this.renderCell(row[0])}
        {this.renderCell(row[1], true)}
        {this.renderCell(row[2])}
        {this.renderCell(row[3], true)}
        {this.renderCell(row[4], true)}
        {this.renderCell(row[5])}
        {this.renderCell(row[6], true)}
        {this.renderCell(row[7], true)}
        {this.renderCell(row[8])}
        {this.renderCell(row[9], true)}
        {this.renderCell(row[10], true)}
        {this.renderCell(row[11])}
      </tr>
    );
  }

  private renderCell = (entry: string | number | undefined, percent?: boolean) => {
    if (typeof entry === 'string') {
      return <td>{entry}</td>;
    } else if (entry !== undefined) {
      let value = `${chop(entry * (percent ? 100 : 1), 1)}`;
      if (percent) {
        value += '%';
      }
      return <td>{value}</td>
    } else {
      return <td className='not-applicable'>N/A</td>;
    }
  }
}

const loaders = {
  players: playersLoader,
  stats: statsLoader,
};

export const AllWinPercentagesTab = loadContainer(loaders)(AllWinPercentagesTabInternal);

import * as React from 'react';
import { connect } from 'react-redux';
import { ReduxState } from '../../services/rootReducer';
import { PlayersService } from '../../services/players';
import { DispatchersContextType, DispatchContext } from '../../dispatchProvider';
import { Dispatchers } from '../../services/dispatchers';
import { RecordsService } from '../../services/records/index';
import { SpinnerOverlay } from '../../components/spinnerOverlay/SpinnerOverlay';
import { Player } from '../../../server/model/Player';
import { Records, MonthlyScore } from '../../../server/model/Records';
import { Tabs2, Tab2 } from '@blueprintjs/core';
import { Result } from '../../../server/model/Result';
import { ScoreTable } from '../../components/scoreTable/ScoreTable';
import { Game } from '../../../server/model/Game';
import { GameTable } from '../../components/gameTable/GameTable';
import { arrayMax, integerComparator } from '../../../server/utils/index';
import { Link } from 'react-router';
import { DynamicRoutes } from '../../routes';
import { count, Aggregator, Aggregate } from '../../../server/utils/count';
import { IMonth } from '../../../server/model/Month';
import { Checkbox } from '@blueprintjs/core';
import { StatsService } from '../../services/stats/index';
import { AggregatedStats } from '../../../server/model/Stats';
import { WinPercentagesTab } from './WinPercentagesTab';

interface SlamRecords {
  slammed: SlamRecord[];
  beenSlammed: SlamRecord[];
}

interface SlamRecord {
  id: string;
  count: number;
}

interface Props {
  players: PlayersService;
  records: RecordsService;
  stats: StatsService;
}

interface State {
  filterRecords: boolean;
}

interface MonthWinners {
  month: IMonth;
  first: MonthlyScore;
  second: MonthlyScore;
  third: MonthlyScore;
}

interface MedalEntry {
  id: string;
  rank: number;
}

interface MedalRecord {
  id: string;
  firsts: number;
  seconds: number;
  thirds: number;
}

class Internal extends React.PureComponent<Props, State> {
  public static contextTypes = DispatchersContextType;
  private dispatchers: Dispatchers;
  
  constructor(props: Props, context: DispatchContext) {
    super(props, context);
    this.dispatchers = context.dispatchers;
    this.state = {
      filterRecords: false,
    };
  }

  public componentWillMount() {
    this.dispatchers.players.request(undefined);
    this.dispatchers.records.request(undefined);
    this.dispatchers.stats.request(undefined);
  }

  public render() {
    return (
      <div className='records-container page-container'>
        <div className='title'>
          <h1>Records</h1>
        </div>
        {this.renderContainer()}
      </div>
    );
  }

  private renderContainer() {
    if (this.props.players.loading || this.props.records.loading || this.props.stats.loading) {
      return <SpinnerOverlay size='pt-large'/>;
    } else if (this.props.players.value && this.props.records.value && this.props.stats.value) {
      return this.renderContents(this.props.players.value, this.props.records.value, this.props.stats.value);
    } else if (this.props.players.error) {
      return <p>Error loading players: {this.props.players.error}</p>;
    } else if (this.props.records.error) {
      return <p>Error loading records games: {this.props.records.error}</p>;
    } else {
      return <p>Something went wrong...</p>;
    }
  }

  private renderContents(players: Map<string, Player>, records: Records, stats: AggregatedStats) {
    const allTimeTab = this.renderAllTimeTab(players, records.scores);
    const monthlyTab = this.renderMonthlyTab(players, records.scores);
    const slamTab = this.renderSlamTab(players, records.slamGames);
    const winPercentagesTab = (
      <WinPercentagesTab
        dispatchers={this.dispatchers}
        players={players}
        stats={stats}
      />
    );
    return (
      <div className='records-tabs-container'>
        <Tabs2 id='ResultsTabs' className='records-tabs' renderActiveTabPanelOnly={true}>
          <Tab2 id='RecordsAllTimeTab' title='All-Time' panel={allTimeTab} />
          <Tab2 id='RecordsMonthlyTab' title='Monthly' panel={monthlyTab} />
          <Tab2 id='RecordsSlamTab' title='Slams' panel={slamTab} />
          <Tab2 id='RecordsWinPercentagesTab' title='Win Percentages' panel={winPercentagesTab} />
        </Tabs2>
      </div>
    );
  }

  /*
   * All-time Tab
   */

  private renderAllTimeTab(players: Map<string, Player>, monthlyScores: MonthlyScore[]) {
    let results = this.getTotalScoresFromMonthlyScore(monthlyScores);
    if (this.state.filterRecords) {
      results = results.filter((result: Result) => {
        return result.gamesPlayed >= 100;
      });
    }
    return (
      <div className='all-time-tab-container tab-container'>
        <Checkbox
          checked={this.state.filterRecords}
          label='Filter players who have played less than 100 games: '
          onChange={this.onFilterRecordsChanged}
        />
        <div className='all-time-table-container table-container'>
          <ScoreTable
            results={results}
            players={players}
            navigationDispatcher={this.dispatchers.navigation}
          />
        </div>
      </div>
    );
  }

  private onFilterRecordsChanged = () => {
    this.setState({
      filterRecords: !this.state.filterRecords,
    });
  }

  private getTotalScoresFromMonthlyScore(monthlyScores: MonthlyScore[]): Result[] {
    const pointsAggregator: Aggregator<MonthlyScore, number, number> = {
      name: 'points',
      initialValue: 0,
      extractor: (monthlyScore: MonthlyScore) => monthlyScore.score,
      aggretator: (aggregate: number, value: number) => aggregate + value,
    };
    const gamesPlayedAggregator: Aggregator<MonthlyScore, number, number> = {
      name: 'gamesPlayed',
      initialValue: 0,
      extractor: (monthlyScore: MonthlyScore) => monthlyScore.gameCount,
      aggretator: (aggregate: number, value: number) => aggregate + value,
    };

    return count<MonthlyScore>(
      monthlyScores,
      (monthlyScore) => monthlyScore.playerId,
      [pointsAggregator, gamesPlayedAggregator],
    ).map((aggregate) => {
      return {
        id: aggregate.id,
        points: aggregate.values[pointsAggregator.name],
        gamesPlayed: aggregate.values[gamesPlayedAggregator.name],
      }
    }).sort(integerComparator((r: Result) => r.points, 'desc'));
  }

  /*
   * Monthly Tab
   */
  
  private renderMonthlyTab(players: Map<string, Player>, monthlyScores: MonthlyScore[]) {
    const groupedMonthlyScores = this.countMonthlyScores(monthlyScores);
    return (
      <div className='monthly-tab-container tab-container'>
        {this.renderRecordScores(players, monthlyScores)}
        {this.renderEachMonthWinners(players, groupedMonthlyScores)}
        {this.renderMedalists(players, groupedMonthlyScores)}
      </div>
    );
  }

  private renderRecordScores(players: Map<string, Player>, monthlyScores: MonthlyScore[]) {
    const maxMonthlyScore = arrayMax(monthlyScores, (monthlyScore) => monthlyScore.score)!;
    const maxMonthlyScorePlayer = players.get(maxMonthlyScore.playerId);
    const maxMonth = `${maxMonthlyScore.year}/${maxMonthlyScore.month}`;
    const minMonthlyScore = arrayMax(monthlyScores, (monthlyScore) => -monthlyScore.score)!;
    const minMonthlyScorePlayer = players.get(minMonthlyScore.playerId);
    const minMonth = `${minMonthlyScore.year}/${minMonthlyScore.month}`;
    return (
      <div className='sub-container'>
        <h3> Month Records </h3>
        <p>
          <span className='bold'>Highest Monthly Scorer:</span>
          <Link to={DynamicRoutes.player(maxMonthlyScore.playerId)}> {Player.getName(maxMonthlyScore.playerId, maxMonthlyScorePlayer)}</Link>
          : {maxMonthlyScore.score} ({maxMonth})
        </p>
        <p>
          <span className='bold'>Lowest Monthly Scorer:</span>
          <Link to={DynamicRoutes.player(minMonthlyScore.playerId)}> {Player.getName(minMonthlyScore.playerId, minMonthlyScorePlayer)}</Link>
          : {minMonthlyScore.score} ({minMonth})
        </p>
      </div>
    );
  }

  private renderEachMonthWinners(players: Map<string, Player>, groupedMonthlyScores: MonthlyScore[][]) {
    const eachMonthWinners = this.countMonthWinners(groupedMonthlyScores)
      .sort(IMonth.comparator((monthWinners: MonthWinners) => monthWinners.month, 'asc'));
    return (
      <div className='sub-container'>
        <h3> Month Winners </h3>
        <table className='slam-count-table pt-table pt-bordered'>
          <thead>
            <tr>
              <th>Month</th>
              <th>First</th>
              <th>Second</th>
              <th>Third</th>
            </tr>
          </thead>
          <tbody>
            {eachMonthWinners.map((monthWinners: MonthWinners) => this.renderMonthWinners(players, monthWinners))}
          </tbody>
        </table>
      </div>
    );
  }

  private renderMonthWinners(players: Map<string, Player>, monthWinners: MonthWinners) {
    return (
      <tr key={IMonth.toString(monthWinners.month)}>
        <td>{monthWinners.month.getHumanReadableString()}</td>
        {this.renderScoreCell(players, monthWinners.first)}
        {this.renderScoreCell(players, monthWinners.second)}
        {this.renderScoreCell(players, monthWinners.third)}
      </tr>
    );
  }

  private renderScoreCell(players: Map<string, Player>, monthScore: MonthlyScore) {
    if (monthScore) {
      return (
        <td>
          <Link to={DynamicRoutes.player(monthScore.playerId)}>
            {Player.getName(monthScore.playerId, players.get(monthScore.playerId))}
          </Link>
          <span> ({monthScore.score})</span>
        </td>
      );
    } else {
      return <td/>;
    }
  }

  private renderMedalists(players: Map<string, Player>, groupedMonthlyScores: MonthlyScore[][]) {
    const medalRecords = this.countMonthMedals(groupedMonthlyScores)
      .sort(
        integerComparator((medalRecord: MedalRecord) => medalRecord.firsts, 'desc',
        integerComparator((medalRecord: MedalRecord) => medalRecord.seconds, 'desc',
        integerComparator((medalRecord: MedalRecord) => medalRecord.thirds, 'desc')))
      );
    return (
      <div className='sub-container'>
        <h3> Month Win Counts </h3>
        <table className='slam-count-table pt-table pt-bordered'>
          <thead>
            <tr>
              <th>Player</th>
              <th>Medals</th>
            </tr>
          </thead>
          <tbody>
            {medalRecords.map((medalRecord: MedalRecord) => this.renderMedalRecord(players, medalRecord))}
          </tbody>
        </table>
      </div>
    );
  }

  private renderMedalRecord(players: Map<string, Player>, medalRecord: MedalRecord) {
    return (
      <tr key={medalRecord.id}>
        <td>
          <Link to={DynamicRoutes.player(medalRecord.id)}>
            {Player.getName(medalRecord.id, players.get(medalRecord.id))}
          </Link>
        </td>
        <td className='medal-row'>
          <span>{medalRecord.firsts}</span>
          <img className='player-medal' src='/static/images/gold-medal.svg'/>
          <span>{medalRecord.seconds}</span>
          <img className='player-medal' src='/static/images/silver-medal.svg'/>
          <span>{medalRecord.thirds}</span>
          <img className='player-medal' src='/static/images/bronze-medal.svg'/>
        </td>
      </tr>
    );
  }

  private countMonthlyScores(monthlyScores: MonthlyScore[]): MonthlyScore[][] {
    const monthAggregator: Aggregator<MonthlyScore, MonthlyScore, MonthlyScore[]> = {
      name: 'month',
      initialValue: [],
      extractor: (monthlyScore: MonthlyScore) => monthlyScore,
      aggretator: (aggregate: MonthlyScore[], value: MonthlyScore) => [...aggregate, value],
    };
    return count<MonthlyScore>(
      monthlyScores.filter((monthlyScore) => {
        return IMonth.n(monthlyScore.month, monthlyScore.year) !== IMonth.now(); 
      }),
      (monthlyScore) => IMonth.toString(IMonth.n(monthlyScore.month, monthlyScore.year)),
      [monthAggregator],
    ).map((aggregate: Aggregate) => {
      const scores = aggregate.values[monthAggregator.name] as MonthlyScore[];
      scores.sort(integerComparator((monthlyScore: MonthlyScore) => monthlyScore.score, 'desc'));
      return scores;
    });
  }

  private countMonthWinners(sortedMonthlyScores: MonthlyScore[][]): MonthWinners[] {
    return sortedMonthlyScores.map((monthScores: MonthlyScore[]) => {
      return {
        month: IMonth.n(monthScores[0].month, monthScores[0].year),
        first: monthScores[0],
        second: monthScores[1],
        third: monthScores[2],
      };
    });
  }

  private countMonthMedals(sortedMonthlyScores: MonthlyScore[][]): MedalRecord[] {
    const firsts: MedalEntry[] = [];
    const seconds: MedalEntry[] = [];
    const thirds: MedalEntry[] = [];
    sortedMonthlyScores.forEach((monthlyScores: MonthlyScore[]) => {
      firsts.push({
        id: monthlyScores[0].playerId,
        rank: 0,
      });
      seconds.push({
        id: monthlyScores[1].playerId,
        rank: 1,
      });
      thirds.push({
        id: monthlyScores[2].playerId,
        rank: 2,
      });
    });
    const medals = [...firsts, ...seconds, ...thirds];
    const firstsAggregator: Aggregator<MedalEntry, boolean, number> = {
      name: 'firsts',
      initialValue: 0,
      extractor: (medal: MedalEntry) => medal.rank === 0,
      aggretator: (aggregate: number, rank: boolean) => rank ? aggregate + 1 : aggregate,
    };
    const secondsAggregator: Aggregator<MedalEntry, boolean, number> = {
      name: 'seconds',
      initialValue: 0,
      extractor: (medal: MedalEntry) => medal.rank === 1,
      aggretator: (aggregate: number, rank: boolean) => rank ? aggregate + 1 : aggregate,
    };
    const thirdsAggregator: Aggregator<MedalEntry, boolean, number> = {
      name: 'thirds',
      initialValue: 0,
      extractor: (medal: MedalEntry) => medal.rank === 2,
      aggretator: (aggregate: number, rank: boolean) => rank ? aggregate + 1 : aggregate,
    };
    return count<MedalEntry>(
      medals,
      (medal: MedalEntry) => medal.id,
      [firstsAggregator, secondsAggregator, thirdsAggregator],
    ).map((aggregate: Aggregate) => {
      return {
        id: aggregate.id,
        firsts: aggregate.values[firstsAggregator.name],
        seconds: aggregate.values[secondsAggregator.name],
        thirds: aggregate.values[thirdsAggregator.name],
      };
    });
  }

  /*
   * Slam Tab
   */

  private renderSlamTab(players: Map<string, Player>, slamGames: Game[]) {
    const slamRecords = this.countSlams(slamGames);
    return (
      <div className='slam-tab-container tab-container'>
        <h3> Slam Count </h3>
        {this.renderSlamCountTable(players, slamRecords.slammed)}
        <h3> Been Slammed Count </h3>
        {this.renderSlamCountTable(players, slamRecords.beenSlammed)}
        <h3> Slam Games </h3>
        <div className='slam-table-container table-container'>
          <GameTable
            players={players}
            games={slamGames}
            navigationDispatcher={this.dispatchers.navigation}
          />
        </div>
      </div>
    );
  }

  private renderSlamCountTable(players: Map<string, Player>, slams: SlamRecord[]) {
    return (
      <div className='slam-count-table-container'>
        <table className='slam-count-table pt-table pt-bordered'>
          <thead>
            <tr>
              <th>Player</th>
              <th># of Slams</th>
            </tr>
          </thead>
          <tbody>
            {slams.map((record) => this.renderSlamCountRow(players, record))}
          </tbody>
        </table>
      </div>
    );
  }

  private renderSlamCountRow(players: Map<string, Player>, record: SlamRecord) {
    return (
      <tr key={record.id}>
        <td>{Player.getName(record.id, players.get(record.id))}</td>
        <td>{record.count}</td>
      </tr>
    );
  }

  private countSlams(slamGames: Game[]): SlamRecords {
    const slamPlayers: string[] = [];
    const beenSlammedPlayers: string[] = [];
    slamGames.forEach((game) => {
      slamPlayers.push(game.bidderId);
      if (game.partnerId) {
        slamPlayers.push(game.partnerId);
      }
      game.handData.opposition.forEach((hand) => beenSlammedPlayers.push(hand.id));
    });
    const slamCounts = this.countPlayers(slamPlayers)
      .sort(integerComparator((record: SlamRecord) => record.count, 'desc'));
    const beenSlammedCounts = this.countPlayers(beenSlammedPlayers)
      .sort(integerComparator((record: SlamRecord) => record.count, 'desc'));
    return {
      slammed: slamCounts,
      beenSlammed: beenSlammedCounts,
    }
  }

  private countPlayers(players: string[]): SlamRecord[] {
    const counts = new Map<string, SlamRecord>();
    players.forEach((id: string) => {
      if (!counts.has(id)) {
        counts.set(id, { id, count: 0 });
      }
      const record = counts.get(id)!;
      counts.set(id, { id, count: record.count + 1 });
    });
    return Array.from(counts.values());
  }
}

const mapStateToProps = (state: ReduxState): Props => {
  return {
    players: state.players,
    records: state.records,
    stats: state.stats,
  }
}

export const RecordsContainer = connect(mapStateToProps)(Internal);
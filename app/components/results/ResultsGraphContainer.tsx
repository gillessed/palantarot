import React, { PureComponent } from 'react';
import { IMonth, Month } from '../../../server/model/Month';
import moment from 'moment-timezone';
import { Timeseries, PlayerResult } from '../graphs/index';
import { ResultsGraph } from '../graphs/ResultsGraph';
import { Player } from '../../../server/model/Player';
import { MonthGamesService, MonthGamesDispatcher } from '../../services/monthGames/index';
import { Game } from '../../../server/model/Game';

interface Props {
  monthGames: MonthGamesService;
  monthGamesDispatcher: MonthGamesDispatcher;
  players: Map<string, Player>;
  month: Month;
}

export class ResultsGraphContainer extends PureComponent<Props, {}> {
  constructor(props: Props) {
    super(props);
  }

  public componentWillMount() {
    this.props.monthGamesDispatcher.requestSingle(this.props.month);
  }

  public render() {
      return (
        <div style={{display: 'flex', flexDirection: 'column'}}>
          <div className='results-graph-container'>
            {this.renderContainer()}
          </div>
        </div>
      );
  }

  public renderContainer() {
    const gamesLoadable = this.props.monthGames.get(this.props.month);
    if (gamesLoadable.loading) {
      return (
        <div className={`pt-spinner .pt-large .pt-intent-primary`}>
          <div className='pt-spinner-svg-container'>
            <svg viewBox='0 0 100 100'>
              <path className='pt-spinner-track' d="M 50,50 m 0,-44.5 a 44.5,44.5 0 1 1 0,89 a 44.5,44.5 0 1 1 0,-89"></path>
              <path className='pt-spinner-head' d="M 94.5 50 A 44.5 44.5 0 0 0 50 5.5"></path>
            </svg>
          </div>
        </div>
      );
    } else if (gamesLoadable.value) {
      const games = this.sortGames(gamesLoadable.value);
      return this.renderChart(games);
    } else if (gamesLoadable.error) {
      return <p> Error loading games for month {JSON.stringify(this.props.month)}</p>;
    } else {
      return <p> Something went wrong </p>;
    }
  }

  private sortGames(games: Game[]): Game[] {
    return Array.from(games).sort((g1: Game, g2: Game) => {
      if (moment(g1.timestamp).isBefore(moment(g2.timestamp))) {
        return -1;
      } else if (moment(g1.timestamp).isAfter(moment(g2.timestamp))) {
        return 1;
      } else {
        return 0;
      }
    });
  }

  private renderChart(games: Game[]) {
    const rangeStartString = moment().year(this.props.month.year).month(this.props.month.month).date(1).hour(0).minute(0).second(0).format('YYYY-MM-DDTHH:mm:ss');
    const rangeStart = new Date(rangeStartString);
    let rangeEndString: string;
    if (this.props.month === IMonth.now()) {
      rangeEndString = moment(games[games.length - 1].timestamp).add(1, 'days').hour(0).minute(0).second(0).format('YYYY-MM-DDTHH:mm:ss');
    } else {
      rangeEndString = moment(rangeStart).add(1, 'month').format('YYYY-MM-DDTHH:mm:ss');
    }
    const rangeEnd = new Date(rangeEndString);

    let range: [Date, Date] = [rangeStart, rangeEnd];

    const results: PlayerResult[] = Timeseries.createResultsFromGames(games, this.props.players, rangeStartString, rangeEndString);

    return (
      <ResultsGraph
        results={results}
        dateRange={range}
      />
    );
  }
}
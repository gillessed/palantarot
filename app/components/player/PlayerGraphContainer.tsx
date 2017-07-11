import React, { PureComponent } from 'react';
import { MonthGamesService } from '../../services/monthGames/index';
import { IMonth, Month } from '../../../server/model/Month';
import { Game } from '../../../server/model/Game';
import moment from 'moment-timezone';
import { Timeseries, PlayerResult } from '../graphs/index';
import { ResultsGraph } from '../graphs/ResultsGraph';
import { Player } from '../../../server/model/Player';

interface Props {
  player: Player;
  monthGames: MonthGamesService;
  dispatchRequest: (month: Month) => void;
}

interface State {
  month: IMonth;
}

export class PlayerGraphContainer extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      month: IMonth.now(),
    };
  }

  public render() {
    return (
      <div style={{display: 'flex', flexDirection: 'column'}}>
        {this.renderHeader()}
        <div className='player-graph-container'>
          {this.renderLoadableChart()}
        </div>
      </div>
    );
  }

  private renderHeader() {
    const zeroPadMonth = `00${this.state.month.month + 1}`.slice(-2);
    return (
        <div className='player-graph-header'>
          <button
            type='button'
            className={'pt-button pt-large pt-icon-chevron-left'}
            onClick={this.previousMonth}
          />
          <div className='title'>
            <h1 style={{textAlign: 'center'}}>Results for {this.state.month.year}/{zeroPadMonth}</h1>
          </div>
          <button
            type='button'
            className={`pt-button pt-large pt-icon-chevron-right ${this.isCurrentMonth() ? 'pt-disabled' : ''}`}
            onClick={this.nextMonth}
          />
        </div>
    );
  }

  private renderLoadableChart() {
    const games = this.props.monthGames.get(this.state.month);
    if (games.loading) {
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
    } else if (games.error) {
      return <p>Error loading games for {`${this.state.month.month}/${this.state.month.year}`}: {games.error}</p>;
    } else if (games.value) {
      if (games.value.length > 0) {
        return this.renderChart(games.value);
      } else {
        return <h4>No games for this month.</h4>;
      }
    } else {
      return <p>Something went wrong</p>;
    }
  }

  private renderChart(games: Game[]) {

    const rangeStartString = moment().year(this.state.month.year).month(this.state.month.month).date(1).hour(0).minute(0).second(0).format('YYYY-MM-DD HH:mm:ss');
    const rangeStart = new Date(rangeStartString);
    let rangeEndString: string;
    if (this.state.month === IMonth.now()) {
      rangeEndString = moment(games[games.length - 1].timestamp).add(1, 'days').hour(0).minute(0).second(0).format('YYYY-MM-DD HH:mm:ss');
    } else {
      rangeEndString = moment(rangeStart).add(1, 'month').format('YYYY-MM-DD HH:mm:ss');
    }
    const rangeEnd = new Date(rangeEndString);

    let range: [Date, Date] = [rangeStart, rangeEnd];

    const playerEntry = [this.props.player.id, this.props.player] as [string, Player];
    const results: PlayerResult[] = Timeseries.createResultsFromGames(games, new Map<string, Player>([playerEntry]), rangeStartString, rangeEndString);

    return (
      <ResultsGraph
        results={results}
        dateRange={range}
      />
    );
  }

  private isCurrentMonth() {
    return moment().year() === this.state.month.year && moment().month() === this.state.month.month;
  }

  private previousMonth = () => {
    const previousMonth = this.state.month.previous();
    this.setState({
      month: previousMonth,
    });
    this.props.dispatchRequest(previousMonth);
  }

  private nextMonth = () => {
    if (this.isCurrentMonth()) {
      return;
    }
    const nextMonth = this.state.month.next();
    this.setState({
      month: nextMonth,
    });
    this.props.dispatchRequest(nextMonth);
  }
}
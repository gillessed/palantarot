import moment from 'moment-timezone';
import React, { PureComponent } from 'react';
import { GameRecord } from '../../../server/model/GameRecord';
import { IMonth } from '../../../server/model/Month';
import { Player } from '../../../server/model/Player';
import { PlayerResult, Timeseries } from '../../components/graphs/index';
import { ResultsGraph } from '../../components/graphs/ResultsGraph';
import { MonthPicker } from '../../components/monthPicker/MonthPicker';
import { Dispatchers } from '../../services/dispatchers';
import { monthGamesLoader } from '../../services/monthGames/index';
import { playersLoader } from '../../services/players';
import { loadContainer } from '../LoadingContainer';

interface InternalProps {
  playerId: string;
  players: Map<string, Player>;
  monthGames: GameRecord[];
  dispatchers: Dispatchers;
  month: IMonth;
}

class PlayerGraphTabInternal extends PureComponent<InternalProps, {}> {
  public render() {
    return (
      <>
        {this.props.monthGames.length >= 1 && this.renderChart()}
        {this.props.monthGames.length === 0 && this.renderEmpty()}
      </>
    );
  }

  private renderChart() {
    const games = this.props.monthGames;
    const player = this.props.players.get(this.props.playerId);
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

    const playerEntry = [this.props.playerId, player] as [string, Player];
    const results: PlayerResult[] = Timeseries.createResultsFromGames(games, new Map<string, Player>([playerEntry]), rangeStartString, rangeEndString);

    return (
      <ResultsGraph
        results={results}
        dateRange={range}
      />
    );
  }

  private renderEmpty() {
    return <h4 className='bp3-heading'>No games for this month.</h4>;
  }
}

const loaders = {
  players: playersLoader,
  monthGames: monthGamesLoader,
}

const PlayerGraphTabLoader = loadContainer(loaders)(PlayerGraphTabInternal);

interface Props {
  playerId: string;
}

interface State {
  month: IMonth;
}

export class PlayerGraphTab extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      month: IMonth.now(),
    }
  }

  public render() {
    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <MonthPicker
          month={this.state.month}
          onMonthUpdated={this.onMonthUpdated}
        />
        <div className='player-graph-container'>
          <PlayerGraphTabLoader
            playerId={this.props.playerId}
            monthGames={this.state.month}
            month={this.state.month}
          />
        </div>
      </div>
    );
  }

  private onMonthUpdated = (month: IMonth) => {
    this.setState({ month });
  }
}

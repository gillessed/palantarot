import React, { PureComponent } from 'react';
import { IMonth, Month } from '../../../server/model/Month';
import moment from 'moment-timezone';
import { Timeseries, PlayerResult } from '../graphs/index';
import { ResultsGraph } from '../graphs/ResultsGraph';
import { Player } from '../../../server/model/Player';
import { MonthGamesService, MonthGamesDispatcher, monthGamesLoader } from '../../services/monthGames/index';
import { Game } from '../../../server/model/Game';
import { loadContainer } from '../../containers/LoadingContainer';
import { playersLoader } from '../../services/players/index';

interface Props {
  month: Month;
  monthGames: Game[];
  players: Map<string, Player>;
}

class ResultsGraphContainerInternal extends PureComponent<Props, {}> {
  constructor(props: Props) {
    super(props);
  }

  public render() {
      return (
        <div style={{display: 'flex', flexDirection: 'column'}}>
          <div className='results-graph-container'>
            {this.renderChart()}
          </div>
        </div>
      );
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

  private renderChart() {
    const games = this.props.monthGames;
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

export const ResultsGraphContainer = loadContainer({
  players: playersLoader,
  monthGames: monthGamesLoader,
})(ResultsGraphContainerInternal);

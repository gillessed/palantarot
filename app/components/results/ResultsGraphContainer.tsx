import React, { PureComponent } from 'react';
import { IMonth, Month } from '../../../server/model/Month';
import { Game } from '../../../server/model/Game';
import moment from 'moment-timezone';
import { Timeseries, PlayerResult } from '../graphs/index';
import { ResultsGraph } from '../graphs/ResultsGraph';
import { Player } from '../../../server/model/Player';

interface Props {
  games: Game[];
  players: Map<string, Player>;
  month: Month;
}

export class ResultsGraphContainer extends PureComponent<Props, void> {
  constructor(props: Props) {
    super(props);
  }

  public render() {
    console.log(this.props.games);
    return (
      <div style={{display: 'flex', flexDirection: 'column'}}>
        <div className='results-graph-container'>
          {this.renderChart()}
        </div>
      </div>
    );
  }

  private renderChart() {
    const rangeStartString = moment().year(this.props.month.year).month(this.props.month.month).date(1).hour(0).minute(0).second(0).format('YYYY-MM-DD HH:mm:ss');
    const rangeStart = new Date(rangeStartString);
    let rangeEndString: string;
    if (this.props.month === IMonth.now()) {
      rangeEndString = moment(this.props.games[this.props.games.length - 1].timestamp).add(1, 'days').hour(0).minute(0).second(0).format('YYYY-MM-DD HH:mm:ss');
    } else {
      rangeEndString = moment(rangeStart).add(1, 'month').format('YYYY-MM-DD HH:mm:ss');
    }
    const rangeEnd = new Date(rangeEndString);

    let range: [Date, Date] = [rangeStart, rangeEnd];

    const results: PlayerResult[] = Timeseries.createResultsFromGames(this.props.games, this.props.players, rangeStartString, rangeEndString);

    return (
      <ResultsGraph
        results={results}
        dateRange={range}
      />
    );
  }
}
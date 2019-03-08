import * as React from 'react';
import { MonthlyScore, Records } from '../../../../server/model/Records';
import { Player } from '../../../../server/model/Player';
import { IMonth } from '../../../../server/model/Month';
import { integerComparator } from '../../../../server/utils/index';
import { Aggregator, count, Aggregate } from '../../../../server/utils/count';
import { loadContainer } from '../../LoadingContainer';
import { recordsLoader } from '../../../services/records/index';
import { playersLoader } from '../../../services/players/index';
import { RecordScorersTable } from './RecordScorersTable';
import { MonthWinnersTable } from './MonthWinnersTable';
import { MedalsTable } from './MedalsTable';

interface Props {
  playerId?: string;
  players: Map<string, Player>;
  records: Records;
}

class MonthWinsTabInternal extends React.PureComponent<Props, {}> {

  constructor(props: Props) {
    super(props);
  }

  public render() {
    const player = this.props.playerId ? this.props.players.get(this.props.playerId) : undefined;
    const groupedMonthlyScores = this.countMonthlyScores();
    return (
      <div className='monthly-tab-container tab-container'>
        <RecordScorersTable
          players={this.props.players}
          scores={this.filteredMonthlyScores()}
        />
        {groupedMonthlyScores.length > 0 && <MonthWinnersTable
          player={player}
          players={this.props.players}
          groupedMonthlyScores={groupedMonthlyScores}
        />}
        {!player && <MedalsTable 
          players={this.props.players}
          groupedMonthlyScores={groupedMonthlyScores}
        />}
      </div>
    );
  }

  private filteredMonthlyScores = () => {
    if (this.props.playerId) {
      const playerId = this.props.playerId;
      return this.props.records.scores.filter((score) => score.playerId === playerId);
    } else {
      return this.props.records.scores;
    }
  }

  private countMonthlyScores(): MonthlyScore[][] {
    const monthAggregator: Aggregator<MonthlyScore, MonthlyScore, MonthlyScore[]> = {
      name: 'month',
      initialValue: [],
      extractor: (monthlyScore: MonthlyScore) => monthlyScore,
      aggretator: (aggregate: MonthlyScore[], value: MonthlyScore) => [...aggregate, value],
    };
    return count<MonthlyScore>(
      this.props.records.scores.filter((monthlyScore) => {
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
}

const loaders = {
  players: playersLoader,
  records: recordsLoader,
};

export const MonthWinsTab = loadContainer(loaders)(MonthWinsTabInternal);

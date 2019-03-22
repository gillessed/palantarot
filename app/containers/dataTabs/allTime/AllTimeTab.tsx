import * as React from 'react';
import { Player } from '../../../../server/model/Player';
import { Records } from '../../../../server/model/Records';
import { RoleResult } from '../../../../server/model/Result';
import { Checkbox } from '@blueprintjs/core';
import { ScoreTable } from '../../../components/scoreTable/ScoreTable';
import { RecordsSelectors } from '../../../services/records/selectors';
import { playersLoader } from '../../../services/players/index';
import { recordsLoader } from '../../../services/records';
import { loadContainer } from '../../LoadingContainer';


interface Props {
  players: Map<string, Player>;
  records: Records;
}

interface State {
  filterRecords: boolean;
}

class AllTimeTabInternal extends React.PureComponent<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      filterRecords: false,
    };
  }

  public render() {
    let results = RecordsSelectors.getTotalScoresFromMonthlyScore(this.props.records.scores);
    if (this.state.filterRecords) {
      results = results.filter((result: RoleResult) => {
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
            players={this.props.players}
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
}

const loaders = {
  players: playersLoader,
  records: recordsLoader,
};

export const AllTimeTab = loadContainer(loaders)(AllTimeTabInternal);
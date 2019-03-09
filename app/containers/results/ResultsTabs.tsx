import * as React from 'react';
import { IMonth } from '../../../server/model/Month';
import { Result } from '../../../server/model/Result';
import { Tabs, Tab } from '@blueprintjs/core';
import { ResultsGraphContainer } from '../../components/results/ResultsGraphContainer';
import { ScoreTable } from '../../components/scoreTable/ScoreTable';
import { Player } from '../../../server/model/Player';
import { integerComparator } from '../../../server/utils/index';
import { loadContainer } from '../LoadingContainer';
import { playersLoader } from '../../services/players/index';
import { resultsLoader } from '../../services/results/index';

interface Props {
  players: Map<string, Player>;
  results: Result[];
  month: IMonth;
}
class ResultsTabsInternal extends React.PureComponent<Props, {}> {
  public render() {
    if (this.props.results.length) {
      const tableTab = this.renderResultsTable();
      const graphTab = (
        <ResultsGraphContainer
          monthGames={this.props.month}
          month={this.props.month}
        />
      );

      return (
        <div className='results-tabs-container'>
          <Tabs id='ResultsTabs' className='player-tabs' renderActiveTabPanelOnly={true}>
            <Tab id='ResultsTableTab' title='Score Chart' panel={tableTab} />
            <Tab id='ResultsGraphTab' title='Graph' panel={graphTab} />
          </Tabs>
        </div>
      );
    } else {
      return (
        <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: 200}}>
          <h4 className='bp3-heading'> No results for this month!</h4>
        </div>
      );
    }
  }

  private renderResultsTable () {
    const results = Array.from(this.props.results).sort(integerComparator((r: Result) => r.points, 'desc'));
    return (
      <div className='results-table-container table-container'>
        <ScoreTable
          results={results}
          players={this.props.players}
          renderDelta={true}
        />
      </div>
    );
  }
}

export const ResultsTabs = loadContainer({
  players: playersLoader,
  results: resultsLoader,
})(ResultsTabsInternal);
import * as React from 'react';
import { connect } from 'react-redux';
import { ReduxState } from '../../services/rootReducer';
import { IMonth } from '../../../server/model/Month';
import { Result } from '../../../server/model/Result';
import { PlayersService } from '../../services/players';
import { ResultsService } from '../../services/results';
import { SpinnerOverlay } from '../../components/spinnerOverlay/SpinnerOverlay';
import moment from 'moment';
import { DispatchersContextType, DispatchContext } from '../../dispatchProvider';
import { Dispatchers } from '../../services/dispatchers';
import { MonthGamesService } from '../../services/monthGames/index';
import { Tabs2, Tab2 } from '@blueprintjs/core';
import { ResultsGraphContainer } from '../../components/results/ResultsGraphContainer';
import { ScoreTable } from '../../components/scoreTable/ScoreTable';
import { Player } from '../../../server/model/Player';
import { integerComparator } from '../../../server/utils/index';

interface OwnProps {
  children: any[];
}

interface StateProps {
  players: PlayersService;
  results: ResultsService;
  monthGames: MonthGamesService;
}
type Props = OwnProps & StateProps;

interface State {
  month: IMonth,
}

class Internal extends React.PureComponent<Props, State> {
  public static contextTypes = DispatchersContextType;
  private dispatchers: Dispatchers;
  
  constructor(props: Props, context: DispatchContext) {
    super(props, context);
    this.dispatchers = context.dispatchers;
    this.state = {
      month: IMonth.now(),
    };
  }

  public componentWillMount() {
    this.dispatchers.players.request(undefined);
    this.dispatchers.results.requestSingle(this.state.month);
  }

  public render() {
    return (
      <div className='results-container page-container'>
        <div className='results-header'>
          <button
            type='button'
            className={'pt-button pt-large pt-icon-chevron-left'}
            onClick={this.previousMonth}
          />
          <div className='title'>
            <h1 style={{textAlign: 'center'}}>Results for {this.state.month.getHumanReadableString()}</h1>
          </div>
          <button
            type='button'
            className={`pt-button pt-large pt-icon-chevron-right ${this.isCurrentMonth() ? 'pt-disabled' : ''}`}
            onClick={this.nextMonth}
          />
        </div>
        {this.renderContainer()}
      </div>
    );
  }

  private renderContainer() {
    const players = this.props.players;
    const results = this.props.results.get(this.state.month);
    if (players.loading || results.loading) {
      return <SpinnerOverlay size='pt-large' />;
    } else if (players.value && results.value) {
      return this.renderTabs(players.value, results.value,);
    } else if (players.error) {
      return <p>Error loading players: {this.props.players.error}</p>;
    } else if (results.error) {
      return <p>Error loading results: {results.error.message}</p>;
    } else {
      return <p>Something went wrong...</p>;
    }
  }

  private renderTabs(players: Map<string, Player>, resultList: Result[]) {
    if (resultList.length) {
      const tableTab = this.renderResultsTable(players, resultList);
      const graphTab = (
        <ResultsGraphContainer
          players={players}
          monthGames={this.props.monthGames}
          monthGamesDispatcher={this.dispatchers.monthGames}
          month={this.state.month}
        />
      );

      return (
        <div className='results-tabs-container'>
          <Tabs2 id='ResultsTabs' className='player-tabs' renderActiveTabPanelOnly={true}>
            <Tab2 id='ResultsTableTab' title='Score Chart' panel={tableTab} />
            <Tab2 id='ResultsGraphTab' title='Graph' panel={graphTab} />
          </Tabs2>
        </div>
      );
    } else {
      return (
        <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: 200}}>
          <h4> No results for this month!</h4>
        </div>
      );
    }
  }

  private renderResultsTable (players: Map<string, Player>, resultList: Result[]) {
    const results = Array.from(resultList).sort(integerComparator((r: Result) => r.points, 'desc'));
    return (
      <div className='results-table-container table-container'>
        <ScoreTable
          results={results}
          players={players}
          navigationDispatcher={this.dispatchers.navigation}
          renderDelta={true}
        />
      </div>
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
    this.dispatchers.results.requestSingle(previousMonth);
    this.dispatchers.monthGames.requestSingle(previousMonth);
  }

  private nextMonth = () => {
    if (this.isCurrentMonth()) {
      return;
    }
    const nextMonth = this.state.month.next();
    this.setState({
      month: nextMonth,
    });
    this.dispatchers.results.requestSingle(nextMonth);
    this.dispatchers.monthGames.requestSingle(nextMonth);
  }
}



const mapStateToProps = (state: ReduxState, ownProps?: OwnProps): OwnProps & StateProps => {
  return {
    ...ownProps,
    players: state.players,
    results: state.results,
    monthGames: state.monthGames,
  }
}

export const ResultsContainer = connect(mapStateToProps)(Internal);
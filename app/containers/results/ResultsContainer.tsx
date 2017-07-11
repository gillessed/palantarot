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
import { Game } from '../../../server/model/Game';
import { Tabs2, Tab2 } from '@blueprintjs/core';
import { ResultsGraphContainer } from '../../components/results/ResultsGraphContainer';
import { Routes } from '../../routes';

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
    this.dispatchers.monthGames.requestSingle(this.state.month);
  }

  public render() {
    const zeroPadMonth = `00${this.state.month.month + 1}`.slice(-2);
    return (
      <div className='results-container pt-ui-text-large'>
        <div className='results-header'>
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
        {this.renderContainer()}
      </div>
    );
  }

  private renderContainer() {
    const players = this.props.players;
    const results = this.props.results.get(this.state.month);
    const games = this.props.monthGames.get(this.state.month);
    if (players.loading || results.loading || games.loading) {
      return <SpinnerOverlay size='pt-large' />;
    } else if (players.value && results.value && games.value) {
      return this.renderTabs(results.value, games.value);
    } else if (players.error) {
      return <p>Error loading players: {this.props.players.error}</p>;
    } else if (results.error) {
      return <p>Error loading results: {results.error.message}</p>;
    } else if (games.error) {
      return <p>Error loading games: {games.error.message}</p>;
    } else {
      return <p>Something went wrong...</p>;
    }
  }

  private renderTabs(resultList: Result[], games: Game[]) {
    if (resultList.length) {
      const tableTab = this.renderResultsTable(resultList);

      const sortedGames = games.sort((g1: Game, g2: Game) => {
        if (moment(g1.timestamp).isBefore(moment(g2.timestamp))) {
          return -1;
        } else if (moment(g1.timestamp).isAfter(moment(g2.timestamp))) {
          return 1;
        } else {
          return 0;
        }
      });
      const graphTab = (
        <ResultsGraphContainer
          players={this.props.players.value!}
          games={sortedGames}
          month={this.state.month}
        />
      );

      return (
        <div className='results-tabs-container'>
          <Tabs2 id='ResultsTabs' className='player-tabs' renderActiveTabPanelOnly={true}>
            <Tab2 id='ResultsTableTab' title='Recent Games' panel={tableTab} />
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

  private renderResultsTable = (resultList: Result[]) => {
    const results = Array.from(resultList).sort((r1: Result, r2: Result) => {
      if (r1.points > r2.points) {
        return -1;
      } else if (r1.points < r2.points) {
        return 1;
      } else {
        return 0;
      }
    });
    return (
      <div className='results-table-container'>
        <table className='results-table pt-table pt-bordered pt-interactive'>
          <thead>
            <tr>
              <th></th>
              <th>Player</th>
              <th>Total Score</th>
              <th>#</th>
              <th>Avg</th>
            </tr>
          </thead>
          <tbody>
            {results.map(this.renderResultRow)}
          </tbody>
        </table>
      </div>
    );
  }

  private renderResultRow = (result: Result, index: number) => {
    const players = this.props.players.value!;
    const player = players.get(result.id);
    const playerName = player ? `${player.firstName} ${player.lastName}` : `Unknown Player: ${result.id}`;
    const onRowClick = () => {
      if (player) {
        this.dispatchers.navigation.push(Routes.player(player.id));
      }
    }
    return (
      <tr key={result.id} onClick={onRowClick}>
        <td className='rank-row'>{index + 1}</td>
        <td>{playerName}</td>
        <td>{result.points} {this.renderDelta(result.delta)}</td>
        <td>{result.gamesPlayed}</td>
        <td>{(result.points / result.gamesPlayed).toFixed(2)}</td>
      </tr>
    );
  }

  private renderDelta = (delta?: number) => {
    if (!delta) {
      return '';
    }
    if (delta < 0) {
      return (
        <span className='result-delta' style={{color: 'red'}}>
          <span className='pt-icon pt-icon-arrow-down'></span>
          {delta}
        </span>
      );
    } else {
    if (delta > 0) {
      return (
        <span className='result-delta' style={{color: 'green'}}>
          <span className='pt-icon pt-icon-arrow-up'></span>
          {delta}
        </span>
      );
    }}
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
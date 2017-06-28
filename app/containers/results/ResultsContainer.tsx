import * as React from 'react';
import { connect } from 'react-redux';
import { ReduxState } from '../../services/rootReducer';
import { Month, IMonth } from '../../../server/model/Month';
import { Result } from '../../../server/model/Result';
import { playersActionCreators, PlayersService } from '../../services/players';
import { resultsActionCreators, ResultsService } from '../../services/results';
import { SpinnerOverlay } from '../../components/spinnerOverlay/SpinnerOverlay';
import { push } from 'react-router-redux'
import moment from 'moment';

interface OwnProps {
  children: any[];
}

interface StateProps {
  players: PlayersService;
  results: ResultsService;
}

interface DispatchProps {
  loadPlayers: () => void;
  loadResults: (month: Month) => void;
  push: (path: string) => void;
}

type Props = OwnProps & StateProps & DispatchProps;

interface State {
  month: IMonth,
}

class Internal extends React.PureComponent<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      month: IMonth.now(),
    };
  }

  public componentWillMount() {
    this.props.loadPlayers();
    this.props.loadResults(this.state.month);
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
            <p className='pt-running-text'>Click on a row to view a player's stats.</p>
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
    const results = this.props.results;
    if (players.loading || results.loading) {
      return <SpinnerOverlay size='pt-large' />;
    } else if (players.value && results.value) {
      return this.renderResultsTable();
    } else if (players.error) {
      return <p>Error loading players: {this.props.players.error}</p>;
    } else if (results.error) {
      return <p>Error loading results: {results.error.message}</p>;
    } else {
      return <p>Something went wrong...</p>;
    }
  }

  private renderResultsTable = () => {
    const results = Array.from(this.props.results.value!).sort((r1: Result, r2: Result) => {
      if (r1.points > r2.points) {
        return -1;
      } else if (r1.points < r2.points) {
        return 1;
      } else {
        return 0;
      }
    });
    if (results.length) {
      return (
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
      );
    } else {
      return <p> No results for this month!</p>;
    }
  }

  private renderResultRow = (result: Result, index: number) => {
    const players = this.props.players.value!;
    const player = players.get(result.id);
    const playerName = player ? `${player.firstName} ${player.lastName}` : `Unknown Player: ${result.id}`;
    return (
      <tr key={result.id}>
        <td className="rank-row">{index + 1}</td>
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
    this.props.loadResults(previousMonth);
  }

  private nextMonth = () => {
    if (this.isCurrentMonth()) {
      return;
    }
    const nextMonth = this.state.month.next();
    this.setState({
      month: nextMonth,
    });
    this.props.loadResults(nextMonth);
  }
}



const mapStateToProps = (state: ReduxState, ownProps?: OwnProps): OwnProps & StateProps => {
  return {
    ...ownProps,
    players: state.players,
    results: state.results,
  }
}

const mapDispatchToProps = (dispatch: any): DispatchProps => {
  return {
    loadPlayers: () => { dispatch(playersActionCreators.request(undefined)); },
    loadResults: (month: Month) => { dispatch(resultsActionCreators.request(month)); },
    push: (path: string) => { dispatch(push(path)); },
  }
}

export const ResultsContainer = connect(mapStateToProps, mapDispatchToProps)(Internal);
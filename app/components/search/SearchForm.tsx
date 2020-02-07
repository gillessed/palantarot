import { Button, Intent } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';
import { Player } from '../../../server/model/Player';
import { emptyPlayerQuery, emptySearchQuery, PlayerQuery, SearchQuery, emptyScoreQuery, ScoreQuery, isQueryEmpty } from '../../../server/model/Search';
import { PlayerQueryComponent } from './PlayerQueryComponent';
import { ScoreQueryComponent } from './ScoreQueryComponent';
import { BidQueryComponent } from './BidQueryComponent';

export namespace SearchForm {
  export interface Props {
    players: Map<string, Player>;
    onSubmit: (query: SearchQuery) => void;
  }

  export interface State {
    query: SearchQuery;
  }
}

export class SearchForm extends React.PureComponent<SearchForm.Props, SearchForm.State> {
  public state = {
    query: emptySearchQuery(),
  };

  public render() {
    return (
      <div className='search-form'>
        <div className='section-header'>
          <h2> Players </h2>
          <Button icon={IconNames.PLUS} minimal onClick={this.onNewPlayerQuery} />
        </div>
        {this.state.query.playerQueries.map(this.renderPlayerQueries)}
        <div className='section-header'>
          <h2> Score </h2>
          <Button icon={IconNames.PLUS} minimal onClick={this.onNewScoreQuery} />
        </div>
        {this.state.query.scoreQueries.map(this.renderScoreQueries)}
        <div className='section-header'>
          <h2> Bid Amount </h2>
        </div>
        <div className='bid-query-container'>
          <BidQueryComponent
            bidQuery={this.state.query.bidQuery}
            onChange={this.handleBidQueryChanged}
          />
        </div>
        <div className='section-header'>
          <h2> Number of Players </h2>
        </div>
        <span>Not ready yet...</span>
        <div className='section-header'>
          <h2> Date Range </h2>
        </div>
        <span>Not ready yet...</span>
        <div className='button-row'>
          <Button
            text='Search'
            onClick={this.handleSearch}
            disabled={isQueryEmpty(this.state.query)}
            large
            intent={Intent.SUCCESS}
            icon={IconNames.SEARCH}
          />
        </div>
      </div>
    );
  }

  public onNewPlayerQuery = () => {
    const firstPlayer = this.props.players.values().next();
    this.setState({
      query: {
        ...this.state.query,
        playerQueries: [...this.state.query.playerQueries, emptyPlayerQuery(firstPlayer.value.id)],
      },
    });
  }

  public renderPlayerQueries = (query: PlayerQuery, index: number) => {
    return (
      <PlayerQueryComponent
        key={`${index}${query.player}`}
        index={index}
        players={this.props.players}
        playerQuery={query}
        onChange={this.handlePlayerQueryChange}
        onDelete={this.handleDeletePlayerQuery}
      />
    );
  }

  public handlePlayerQueryChange = (query: PlayerQuery, index: number) => {
    const newQueries = [...this.state.query.playerQueries];
    newQueries.splice(index, 1, query);
    this.setState({
      query: {
        ...this.state.query,
        playerQueries: newQueries,
      },
    });
  }

  public handleDeletePlayerQuery = (index: number) => {
    const newQueries = [...this.state.query.playerQueries];
    newQueries.splice(index, 1);
    this.setState({
      query: {
        ...this.state.query,
        playerQueries: newQueries,
      },
    });
  }

  public onNewScoreQuery = () => {
    this.setState({
      query: {
        ...this.state.query,
        scoreQueries: [...this.state.query.scoreQueries, emptyScoreQuery()],
      },
    });
  }

  public renderScoreQueries = (query: ScoreQuery, index: number) => {
    return (
      <ScoreQueryComponent
        key={`${index}`}
        index={index}
        scoreQuery={query}
        onChange={this.handleScoreQueryChange}
        onDelete={this.handleDeleteScoreQuery}
      />
    );
  }

  public handleScoreQueryChange = (query: ScoreQuery, index: number) => {
    const newQueries = [...this.state.query.scoreQueries];
    newQueries.splice(index, 1, query);
    this.setState({
      query: {
        ...this.state.query,
        scoreQueries: newQueries,
      },
    });
  }

  public handleDeleteScoreQuery = (index: number) => {
    const newQueries = [...this.state.query.scoreQueries];
    newQueries.splice(index, 1);
    this.setState({
      query: {
        ...this.state.query,
        scoreQueries: newQueries,
      },
    });
  }

  public handleBidQueryChanged = (bidQuery: number[]) => {
    this.setState({
      query: {
        ...this.state.query,
        bidQuery,
      },
    });
  }

  public handleSearch = () => {
    this.props.onSubmit(this.state.query);
  }
}

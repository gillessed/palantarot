import * as React from 'react';
import { Player } from '../../../server/model/Player';
import { Game } from '../../../server/model/Game';
import { NavigationDispatcher } from '../../services/navigation/index';
import { GameTableRow } from './GameTableRow';

export const DEFAULT_COUNT = 20;

export interface PageState {
  offset: number;
  onOffsetChange: (offset: number) => void;
}

export enum GameOutcome {
  WIN,
  LOSS,
  UNKNOWN,
}

export const BidderWonValidator = (game: Game) => {
  if (game.points >= 0) {
    return GameOutcome.WIN;
  } else {
    return GameOutcome.LOSS;
  }
}

interface Props {
  players: Map<string, Player>;
  games: Game[];
  navigationDispatcher: NavigationDispatcher;
  winLossValidator?: (game: Game) => GameOutcome;
  pageState?: PageState;
}

export class GameTable extends React.PureComponent<Props, {}> {

  public render() {
    return (
      <div className='game-table-container'>
        {this.renderPager()}
        {this.renderTable()}
      </div>
    );
  }
  
  private renderPager() {
    if (this.props.pageState) {
      const { offset } = this.props.pageState;
      let pagerText;
      if (this.props.games.length >= 1) {
        const fromGame = this.props.games[this.props.games.length - 1].id;
        const toGame = this.props.games[0].id;
        pagerText = `${fromGame} - ${toGame} (Page ${offset + 1})`
      } else {
        pagerText = 'No games';
      }
      const nextDisabled = offset === 0;
      return (
        <div className='pager-container'>
          <button 
            className='pt-button pt-icon-chevron-left'
            role='button'
            onClick={this.onPreviousClicked}
            disabled={this.props.games.length < DEFAULT_COUNT}
          ></button>
          <button
            className='pt-button pt-icon-chevron-right'
            role='button'
            onClick={this.onNextClicked}
            disabled={nextDisabled}            
          ></button>
          <span className='text'> {pagerText} </span>
        </div>
      );
    }
  }

  private renderTable() {
    return (
      <table className='game-table pt-table pt-bordered pt-interactive'>
        <thead>
          <tr>
            <th>Bidder</th>
            <th>Partner</th>
            <th>Bid</th>
            <th>Points</th>
            <th>Players</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          {this.props.games.map(this.renderGameTableRow)}
        </tbody>
      </table>
    );
  }

  private renderGameTableRow = (game: Game) => {
    let outcome = GameOutcome.UNKNOWN;
    if (this.props.winLossValidator) {
      outcome = this.props.winLossValidator(game);
    }
    return (
      <GameTableRow
        key={game.id}
        players={this.props.players}
        game={game}
        navigationDispatcher={this.props.navigationDispatcher}
        outcome={outcome}
      />
    );
  }

  private onPreviousClicked = () => {
    if (this.props.pageState) {
      this.props.pageState.onOffsetChange(this.props.pageState.offset + 1);
    }
  }

  private onNextClicked = () => {
    if (this.props.pageState) {
      this.props.pageState.onOffsetChange(this.props.pageState.offset - 1);
    }
  }
}
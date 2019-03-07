import * as React from 'react';
import { Player } from '../../../server/model/Player';
import { Game } from '../../../server/model/Game';
import { GameTableRow } from './GameTableRow';
import { HTMLTable, Button } from '@blueprintjs/core';

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
          <Button
            icon='chevron-left'
            onClick={this.onPreviousClicked}
            disabled={this.props.games.length < DEFAULT_COUNT}
          />
          <Button
            icon='chevron-right'
            onClick={this.onNextClicked}
            disabled={nextDisabled}
          />
          <span className='text'> {pagerText} </span>
        </div>
      );
    }
  }

  private renderTable() {
    return (
      <HTMLTable className='game-table' bordered interactive>
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
      </HTMLTable>
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
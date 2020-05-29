import * as React from 'react';
import { Player } from '../../../../server/model/Player';
import { PlayerId } from '../../../play/common';
import { GameplayState } from '../../../play/state';
import { InGameSelectors } from '../../../services/ingame/InGameSelectors';
import { InGameState } from '../../../services/ingame/InGameTypes';
import { getTitleArrangementSpec, TitleArrangementSpec } from '../svg/TitleArrangementSpec';
import { BottomLeftStatus } from './BottomLeftStatus';
import { PlayerTitleSvg } from './PlayerTitleSvg';
import { TopRightStatus } from './TopRightStatus';

interface Props {
  width: number;
  height: number;
  players: Map<string, Player>;
  game: InGameState;
}

export class TitleOverlay extends React.PureComponent<Props> {
  public render() {
    const { game } = this.props;
    const playerOrder = InGameSelectors.getRotatedPlayerOrder(game);
    const spec = getTitleArrangementSpec(playerOrder.length);
    return (<g>
      <BottomLeftStatus {...this.props} />
      <TopRightStatus {...this.props} />
      {this.renderOtherPlayerTitle(playerOrder, 0, spec)}
      {this.renderOtherPlayerTitle(playerOrder, 1, spec)}
      {this.renderOtherPlayerTitle(playerOrder, 2, spec)}
      {this.renderOtherPlayerTitle(playerOrder, 3, spec)}
      {this.renderOtherPlayerTitle(playerOrder, 4, spec)}
    </g>)
  }

  private renderOtherPlayerTitle(playerOrder: PlayerId[], index: number, spec: TitleArrangementSpec): JSX.Element | null {
    const { width, height, game } = this.props;
    if (playerOrder.length <= index) {
      return null;
    }
    const bid = game.state.state === GameplayState.Bidding ? game.state.playerBids.get(playerOrder[index]) : undefined; 
    return (
      <PlayerTitleSvg
        player={{ firstName: playerOrder[index], lastName: '', id: playerOrder[index] }}
        showDealer={this.isDealer(index)}
        showCrown={this.isWinningBidder(index)}
        showPerson={this.isPartner(index)}
        highlight={this.isHighlighted(index)}
        bid={bid}
        {...this.getReadyProps(index)}
        {...spec[index](width, height)}
      />
    );
  }

  private getReadyProps = (index: number) => {
    const { game } = this.props;
    const playerOrder = InGameSelectors.getRotatedPlayerOrder(game);
    return {
      showReady: game.state.state === GameplayState.NewGame && game.state.readiedPlayers.has(playerOrder[index]),
      showUnready: game.state.state === GameplayState.NewGame && !game.state.readiedPlayers.has(playerOrder[index]),
    }
  }

  private isDealer = (index: number) => {
    const { game } = this.props;
    const playerOrder = InGameSelectors.getRotatedPlayerOrder(game);
    return game.state.state !== GameplayState.NewGame && game.state.playerOrder[0] === playerOrder[index];
  }

  private isHighlighted = (index: number) => {
    const { game } = this.props;
    switch (game.state.state) {
      case GameplayState.NewGame: return false;
      case GameplayState.DogReveal:
      case GameplayState.PartnerCall:
      case GameplayState.Bidding: return this.isBidder(index);
      case GameplayState.Playing: return this.isPlayerToPlay(index);
      case GameplayState.NewGame: return false;
    }
  }

  private isBidder = (index: number) => {
    const { game } = this.props;
    if (game.state.toBid == null) {
      return false;
    }
    const playerOrder = InGameSelectors.getRotatedPlayerOrder(game);
    return game.state.playerOrder[game.state.toBid] === playerOrder[index];
  }

  private isWinningBidder = (index: number) => {
    const { game } = this.props;
    if (game.state.winningBid == null) {
      return false;
    }
    const playerOrder = InGameSelectors.getRotatedPlayerOrder(game);
    return game.state.winningBid.player === playerOrder[index];
  }

  private isPartner = (index: number) => {
    const { game } = this.props;
    if (game.state.partner == null) {
      return false;
    }
    const playerOrder = InGameSelectors.getRotatedPlayerOrder(game);
    return game.state.partner === playerOrder[index];
  }

  private isPlayerToPlay = (index: number) => {
    const { game } = this.props;
    if (game.state.toPlay == null) {
      return false;
    }
    const playerOrder = InGameSelectors.getRotatedPlayerOrder(game);
    return game.state.toPlay === playerOrder[index];
  }
}

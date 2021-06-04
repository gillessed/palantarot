import * as React from 'react';
import { Player } from '../../../../server/model/Player';
import { PlayerId } from '../../../play/common';
import { GameplayState } from '../../../play/state';
import { InGameSelectors } from '../../../services/ingame/InGameSelectors';
import { InGameState } from '../../../services/ingame/InGameTypes';
import { isSpectatorModeObserver, SpectatorMode } from '../SpectatorMode';
import { PlayerTitleSvg } from './PlayerTitleSvg';
import { getTitleArrangementSpec, TitleArrangementSpec } from './TitleArrangementSpec';

interface Props {
  width: number;
  height: number;
  players: Map<string, Player>;
  game: InGameState;
  spectatorMode: SpectatorMode;
}

export class PlayerOverlay extends React.PureComponent<Props> {
  public render() {
    const { game, spectatorMode } = this.props;
    const playerOrder = InGameSelectors.getRotatedPlayerOrder(game);
    const spec = getTitleArrangementSpec(playerOrder.length, spectatorMode);
    return (<g>
      {this.renderPlayerTitle(playerOrder, 0, spec)}
      {this.renderPlayerTitle(playerOrder, 1, spec)}
      {this.renderPlayerTitle(playerOrder, 2, spec)}
      {this.renderPlayerTitle(playerOrder, 3, spec)}
      {this.renderPlayerTitle(playerOrder, 4, spec)}
    </g>)
  }

  private renderPlayerTitle(playerOrder: PlayerId[], index: number, spec: TitleArrangementSpec): JSX.Element | null {
    const { width, height, game, players, spectatorMode } = this.props;
    if (playerOrder.length <= index) {
      return null;
    }
    const bid = game.state.state === GameplayState.Bidding ? game.state.playerBids.get(playerOrder[index]) : undefined;
    const player = players.get(playerOrder[index]);
    const hand = isSpectatorModeObserver(spectatorMode) ? game.state.allHands.get(player?.id ?? "") : undefined;
    return (
      <PlayerTitleSvg
        player={player}
        showDealer={this.isDealer(index)}
        showCrown={this.isWinningBidder(index)}
        showPerson={this.isPartner(index)}
        highlight={this.isHighlighted(index)}
        bid={bid}
        spectatorMode={spectatorMode}
        hand={hand}
        playerCount={playerOrder.length}
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

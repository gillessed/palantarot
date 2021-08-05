import * as React from 'react';
import { GameplayState, PlayerId } from '../../../../server/play/model/GameState';
import { ClientGameSelectors } from '../../../services/room/ClientGameSelectors';
import { isSpectatorModeObserver } from '../SpectatorMode';
import { StateViewProps } from '../state/StateViewProps';
import { PlayerTitleSvg } from './PlayerTitleSvg';
import { getTitleArrangementSpec, TitleArrangementSpec } from './TitleArrangementSpec';

export class PlayerOverlay extends React.PureComponent<StateViewProps> {
  public render() {
    const { game, spectatorMode } = this.props;
    const playerOrder = ClientGameSelectors.getRotatedPlayerOrder(game);
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
    const { width, height, game, players, spectatorMode, dispatchers } = this.props;
    if (playerOrder.length <= index) {
      return null;
    }
    const bid = game.playState.state === GameplayState.Bidding ? game.playState.playerBids.get(playerOrder[index]) : undefined;
    const playerId = playerOrder[index];
    const player = players.get(playerId);
    const hand = isSpectatorModeObserver(spectatorMode) ? game.playState.allHands.get(player?.id ?? "") : undefined;
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
        selfId={game.playerId}
        allowPoke={game.playState.allowNotifyPlayer}
        dispatchers={dispatchers}
        {...this.getReadyProps(index)}
        {...spec[index](width, height)}
      />
    );
  }

  private getReadyProps = (index: number) => {
    const { game } = this.props;
    const playerOrder = ClientGameSelectors.getRotatedPlayerOrder(game);
    return {
      showReady: game.playState.state === GameplayState.NewGame && game.playState.readiedPlayers.has(playerOrder[index]),
      showUnready: game.playState.state === GameplayState.NewGame && !game.playState.readiedPlayers.has(playerOrder[index]),
    }
  }

  private isDealer = (index: number) => {
    const { game } = this.props;
    const playerOrder = ClientGameSelectors.getRotatedPlayerOrder(game);
    return game.playState.state !== GameplayState.NewGame && game.playState.playerOrder[0] === playerOrder[index];
  }

  private isHighlighted = (index: number) => {
    const { game } = this.props;
    switch (game.playState.state) {
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
    if (game.playState.toBid == null) {
      return false;
    }
    const playerOrder = ClientGameSelectors.getRotatedPlayerOrder(game);
    return game.playState.playerOrder[game.playState.toBid] === playerOrder[index];
  }

  private isWinningBidder = (index: number) => {
    const { game } = this.props;
    if (game.playState.winningBid == null) {
      return false;
    }
    const playerOrder = ClientGameSelectors.getRotatedPlayerOrder(game);
    return game.playState.winningBid.player === playerOrder[index];
  }

  private isPartner = (index: number) => {
    const { game } = this.props;
    if (game.playState.partner == null) {
      return false;
    }
    const playerOrder = ClientGameSelectors.getRotatedPlayerOrder(game);
    return game.playState.partner === playerOrder[index];
  }

  private isPlayerToPlay = (index: number) => {
    const { game } = this.props;
    if (game.playState.toPlay == null) {
      return false;
    }
    const playerOrder = ClientGameSelectors.getRotatedPlayerOrder(game);
    return game.playState.toPlay === playerOrder[index];
  }
}

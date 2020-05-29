import * as React from 'react';
import { Player } from '../../../../server/model/Player';
import { Dispatchers } from '../../../services/dispatchers';
import { InGameSelectors } from '../../../services/ingame/InGameSelectors';
import { InGameState } from '../../../services/ingame/InGameTypes';
import { ActionButton } from '../svg/ActionButton';
import { TitleOverlay } from '../svg/TitleOverlay';
import './NewGameStateView.scss';

interface Props {
  width: number;
  height: number;
  players: Map<string, Player>;
  game: InGameState;
  dispatchers: Dispatchers;
}

export class NewGameStateView extends React.PureComponent<Props> {
  public render() {
    const { width, height, game, players } = this.props;
    const isParticipant = InGameSelectors.isParticipant(game);
    const isReady = InGameSelectors.isReady(game);
    const isFull = InGameSelectors.isGameFull(game);
    const status = game.state.playerOrder.length < 3
      ? `Waiting for more players to join: ${game.state.playerOrder.length}`
      : `Waiting for players to ready: ${game.state.readiedPlayers.size} / ${game.state.playerOrder.length}`
    return (<g className='new-game-state-view'>
      <TitleOverlay
        width={width}
        height={height}
        players={players}
        game={game}
      />
      {!isParticipant && !isFull && this.renderJoinGameAction()}
      {!isParticipant && isFull && this.renderFullMessage()}
      {isParticipant && !isReady && this.renderReadyActions()}
      {isParticipant && isReady && this.renderUnreadyActions()}
    </g>);
  }

  private renderJoinGameAction() {
    const { width, height } = this.props;
    return (
      <ActionButton
        width={300}
        height={100}
        x={width / 2}
        y={height / 2}
        text='Join Game'
        onClick={this.handleJoinGame}
      />
    );
  }

  private renderReadyActions() {
    const { width, height } = this.props;
    return (
      <>
        <ActionButton
          width={300}
          height={100}
          x={width / 2 - 160}
          y={height / 2}
          text='Ready'
          onClick={this.handleMarkReady}
        />
        <ActionButton
          width={300}
          height={100}
          x={width / 2 + 160}
          y={height / 2}
          text='Leave Game'
          onClick={this.handleLeaveGame}
        />
      </>
    );
  }

  private renderUnreadyActions() {
    const { width, height } = this.props;
    return (
      <ActionButton
        width={300}
        height={100}
        x={width / 2}
        y={height / 2}
        text='Unready'
        onClick={this.handleMarkUnready}
      />
    );
  }

  private renderFullMessage() {
    const { width, height } = this.props;
    return (
      <text
        className='new-game-full unselectable'
        x={width / 2}
        y={height / 2}
        textAnchor='middle'
        dominantBaseline='central'
      >
        This game is currently full
      </text>
    );
  }

  private renderStatus(status: string) {
    const { width, height } = this.props;
    return (
      <text
        className='new-game-status unselectable'
        x={width / 2}
        y={height / 2 - 100}
        textAnchor='middle'
        dominantBaseline='central'
      >
        {status}
      </text>
    );
  }

  private handleJoinGame = () => {
    const player = this.props.game.player;
    this.props.dispatchers.ingame.play(player).enterGame();
  }

  private handleLeaveGame = () => {
    const player = this.props.game.player;
    this.props.dispatchers.ingame.play(player).leaveGame();
  }

  private handleMarkReady = () => {
    const player = this.props.game.player;
    this.props.dispatchers.ingame.play(player).markAsReady();
  }

  private handleMarkUnready = () => {
    const player = this.props.game.player;
    this.props.dispatchers.ingame.play(player).markAsNotReady();
  }
}

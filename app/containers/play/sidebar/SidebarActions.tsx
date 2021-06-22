import { Checkbox, Tooltip } from '@blueprintjs/core';
import * as React from 'react';
import { GameplayState, isGamePlayState } from '../../../../server/play/model/GameState';
import { Dispatchers } from '../../../services/dispatchers';
import { ClientRoom } from '../../../services/room/RoomTypes';
import './SidebarActions.scss';

interface Props {
  room: ClientRoom;
  dispatchers: Dispatchers;
}

const AutopassTooltip = "The client will automatically pass for you when it it your turn to bid"
const AutoplayTooltip = "The client will play a card at random when it is your turn to play";

export class SidebarActions extends React.PureComponent<Props> {
  public render() {
    const { autoplay, autopass, playerId } = this.props.room;
    const playState = this.props.room.game.playState;
    const currentBoardState = playState.state;
    const gamePlayers = new Set(playState.playerOrder);
    const showActions = gamePlayers.has(playerId);
    const enableAutopass = isGamePlayState(currentBoardState, [
      GameplayState.NewGame,
      GameplayState.Bidding,
    ]);
    if (!showActions) {
      return null;
    }
    const autopassButton = (
      <Checkbox
        className='autopass-checkbox'
        checked={autopass}
        onClick={this.toggleAutopass}
        label='Enable autopass'
        disabled={!enableAutopass}
      />
    );
    const autoplayButton = (
      <Checkbox
        className='autoplay-checkbox'
        checked={autoplay}
        onClick={this.toggleAutoplay}
        label='Enable autoplay'
      />
    );
    return (
      <div className='sidebar-actions bp3-dark'>
        {showActions && <Tooltip content={AutopassTooltip}>{autopassButton}</Tooltip>}
        {showActions && <Tooltip content={AutoplayTooltip}>{autoplayButton}</Tooltip>}
      </div>
    );
  }

  private toggleAutopass = () => {
    const { autopass } = this.props.room;
    this.props.dispatchers.room.setAutopass(!autopass);
  }

  private toggleAutoplay = () => {
    const { autoplay } = this.props.room;
    this.props.dispatchers.room.setAutoplay(!autoplay);
  }

}

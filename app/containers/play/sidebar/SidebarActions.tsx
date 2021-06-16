import { Button, ButtonGroup, Intent, Tooltip } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';
import { GameplayState } from '../../../../server/play/model/GameState';
import { Dispatchers } from '../../../services/dispatchers';
import { ClientRoom } from '../../../services/room/RoomTypes';
import './PlaySidebar.scss';

interface Props {
  room: ClientRoom;
  dispatchers: Dispatchers;
}

export class SidebarActions extends React.PureComponent<Props> {
  public render() {
    const { autoplay, playerId } = this.props.room;
    const playState = this.props.room.game.playState;
    const currentBoardState = playState.state;
    const gamePlayers = new Set(playState.playerOrder);
    const showActions = gamePlayers.has(playerId);
    const enableActions = currentBoardState !== GameplayState.NewGame && showActions;
    if (!showActions) {
      return null;
    }
    const autoplayButton = (
      <Button
        className='toggle-autoplay-button'
        icon={IconNames.REFRESH}
        active={autoplay}
        onClick={this.toggleAutoplay}
        text={autoplay ? "Turn Off" : "Turn On"}
        intent={autoplay ? Intent.WARNING : Intent.PRIMARY}
        disabled={!enableActions}
      />
    );
    const shareButton = (
      <Button
        className='share-hand-button'
        icon={IconNames.SHARE}
        onClick={this.setShowPlayers}
        intent={Intent.PRIMARY}
        text="Share"
        disabled={!enableActions}
      />
    );
    return (
      <ButtonGroup className='sidebar-actions bp3-dark' fill>
        {enableActions ? <Tooltip content="Toggle Autoplay">{autoplayButton}</Tooltip> : autoplayButton}
        {enableActions ? <Tooltip content="(currently not working) Share Hand in Chat">{shareButton}</Tooltip> : shareButton}
      </ButtonGroup>
    );
  }

  private toggleAutoplay = () => {
    const { autoplay } = this.props.room;
    this.props.dispatchers.room.setAutoplay(!autoplay);
  }

  private setShowPlayers = () => {
    //TODO figure out how to do this again
    
    // const { playState, playerId } = this.props.room.game;
    // const gamePlayers = new Set(playState.playerOrder);
    // gamePlayers.delete(playerId);
    // let text = '';
    // for (const card of playState.hand) {
    //   text += getEmojiStringFromCard(card);
    // }
    // this.props.dispatchers.room.sendChat(text, undefined, [...gamePlayers]);
  }
}

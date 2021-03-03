import { Button, ButtonGroup, Intent, Tooltip } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';
import { getEmojiStringFromCard } from '../../../components/emoji/emojiRenderer';
import { GameplayState } from '../../../play/state';
import { Dispatchers } from '../../../services/dispatchers';
import { InGameState } from '../../../services/ingame/InGameTypes';
import './PlaySidebar.scss';

interface Props {
  game: InGameState;
  dispatchers: Dispatchers;
}

export class SidebarActions extends React.PureComponent<Props> {
  public render() {
    const { autoplay, state, player } = this.props.game;
    const playState = state.state;
    const gamePlayers = new Set(state.playerOrder);
    const showActions = gamePlayers.has(player);
    const enableActions = playState !== GameplayState.NewGame && showActions;
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
        {enableActions ? <Tooltip content="Share Hand in Chat">{shareButton}</Tooltip> : shareButton}
      </ButtonGroup>
    );
  }

  private toggleAutoplay = () => {
    const { autoplay } = this.props.game;
    this.props.dispatchers.ingame.setAutoplay(!autoplay);
  }

  private setShowPlayers = () => {
    const { state, player } = this.props.game;
    const gamePlayers = new Set(state.playerOrder);
    gamePlayers.delete(player);
    let text = '';
    for (const card of state.hand) {
      text += getEmojiStringFromCard(card);
    }
    this.props.dispatchers.ingame.play(player).sendMessage(text, undefined, [...gamePlayers]);
  }
}

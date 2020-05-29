import { Icon } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';
import { InGameState, MessageGroup } from '../../../services/ingame/InGameTypes';

interface Props {
  game: InGameState;
  message: MessageGroup;
}

export class PlayMessage extends React.PureComponent<Props> {
  public render() {
    const { message, game } = this.props;

    const isParticipant = game.state.playerOrder.indexOf(message.author) >= 0;
    const isYou = game.player === message.author;

    return (
      <div className='play-message-container event-child'>
        <div className='message-author'>
          <Icon
            icon={isParticipant ? IconNames.PERSON : IconNames.EYE_OPEN}
            color={isYou ? '#0F9960' : isParticipant ? '#137CBD' : '#F5F8FA'}
          />
          <div className='message-author-text'>{message.author}</div>
        </div>
        {message.messages.map((text, index) => {
          return <div className='message-body' key={index}>{text}</div>;
        })}
      </div>
    );
  }  
}

function getTimeText(time: number) {
  return (
    <span className="event-list-time">
      [{new Date(time).toLocaleTimeString()}]
    </span>
  )
}

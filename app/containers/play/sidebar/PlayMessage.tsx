import { Icon } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';
import { Player } from '../../../../server/model/Player';
import { InGameState, MessageGroup } from '../../../services/ingame/InGameTypes';
import { getPlayerName } from '../../../services/players/playerName';

interface Props {
  game: InGameState;
  message: MessageGroup;
  players: Map<string, Player>;
}

export class PlayMessage extends React.PureComponent<Props> {
  public render() {
    const { message, game, players } = this.props;

    const isParticipant = game.state.playerOrder.indexOf(message.author) >= 0;
    const isYou = game.player === message.author;
    const player = players.get(message.author);
    const authorName = getPlayerName(player);

    return (
      <div className='play-message-container event-child'>
        <div className='message-author'>
          <Icon
            icon={isParticipant ? IconNames.PERSON : IconNames.EYE_OPEN}
            color={isYou ? '#0F9960' : isParticipant ? '#137CBD' : '#F5F8FA'}
          />
          <div className='message-author-text'>{authorName}</div>
        </div>
        {message.messages.map((text, index) => {
          return <div className='message-body' key={index}>{text}</div>;
        })}
      </div>
    );
  }  
}

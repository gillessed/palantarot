import { Checkbox, Classes, Colors, Icon } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as classNames from 'classnames';
import * as React from 'react';
import { PlayerId } from '../../../../../server/play/model/GameState';
import { PlayerStatus } from '../../../../../server/play/room/PlayerStatus';
import { Dispatchers } from '../../../../services/dispatchers';
import './PlayerRow.scss';

interface Props {
  id: PlayerId;
  isYou: boolean;
  isParticipant: boolean;
  name: string;
  status: PlayerStatus;
  isBot: boolean;
  dispatchers: Dispatchers;
}

export class PlayerRow extends React.PureComponent<Props> {
  public render() {
    const {
      id,
      isYou,
      isParticipant,
      name,
      status,
      isBot,
    } = this.props;
    const online = status === PlayerStatus.Online;
    const rowClasses = classNames('player-row', Classes.DARK);
    return (
      <div key={id} className={rowClasses}>
        <Icon icon={IconNames.DOT} color={online ? Colors.FOREST4 : Colors.GRAY5} />
        {!isBot && isParticipant && <Icon icon={IconNames.PERSON} color={Colors.BLUE5} />}
        {isBot && <Checkbox className='bot-checkbox' checked={isParticipant} onClick={this.handleBotClick}/>}
        <span className='player-name unselectable'>{name} {isYou && ' (You)'}</span>
      </div>
    );
  }

  private handleBotClick = () => {
    const { id, isParticipant, dispatchers } = this.props;
    if (isParticipant) {
      dispatchers.room.removeBot(id);
    } else {
      dispatchers.room.addBot(id);
    }
  }
}

import * as React from 'react';
import { MessageAction, PlayerId } from '../../../play/common';

interface Props {
  playerId: PlayerId;
  message: MessageAction;
}

export class PlayMessage extends React.PureComponent<Props> {
  public render() {
    const { message } = this.props;
    const classes = '';
    return (
      <div className={classes}>
        {getTimeText(message.time)} {this.getPlayerName(message)} said: {message.text}
      </div>
    );
  }  

  private getPlayerName(message: {player: PlayerId}, ifYou = "You", if_not = "") {
    return message.player === this.props.playerId ? ifYou : message.player + if_not;
  }
}

function getTimeText(time: number) {
  return (
    <span className="event-list-time">
      [{new Date(time).toLocaleTimeString()}]
    </span>
  )
}

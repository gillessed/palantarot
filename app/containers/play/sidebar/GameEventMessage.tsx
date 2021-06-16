import * as React from 'react';
import { ChatText } from '../../../../server/play/room/ChatText';

interface Props {
  item: ChatText;
}

export class GameEventMessage extends React.PureComponent<Props> {
  public render() {
    return (
      <div className='game-event-message event-child'>
        {this.props.item.text}
      </div>
    );
  }  
}

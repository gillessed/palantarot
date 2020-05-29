import * as React from 'react';
import {renderCardsText} from "../../../play/ingame/Cards";

interface Props {
  message: string;
}

export class GameEventMessage extends React.PureComponent<Props> {
  public render() {
    return (
      <div className='game-event-message event-child'>
        {renderCardsText(this.props.message)}
      </div>
    );
  }  
}

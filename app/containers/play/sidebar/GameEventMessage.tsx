import * as React from 'react';

interface Props {
  message: string;
}

export class GameEventMessage extends React.PureComponent<Props> {
  public render() {
    return (
      <div className='game-event-message event-child'>
        {this.props.message}
      </div>
    );
  }  
}

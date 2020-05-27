import { Button, Intent } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';
import { MessageAction } from '../../../play/common';
import { PlayActionDispatcher } from '../PlayContainer';
import './PlaySidebar.scss';

interface Props {
  playAction: PlayActionDispatcher;
}

interface State {
  message: string;
}

export class PlayMessageInput extends React.PureComponent<Props> {
  public state: State = {
    message: '',
  };

  public render() {
    return (
      <div className='message-input-area'>
        <textarea
          className='message-input'
          value={this.state.message}
          onChange={this.handleChange}
          onKeyUp={this.handleKeyUp}
        />
        <Button
          className='message-send'
          icon={IconNames.KEY_ENTER}
          intent={Intent.PRIMARY}
          onClick={this.handleSend}
        />
      </div>
    );
  }

  private handleChange: React.ChangeEventHandler<HTMLTextAreaElement> = (event) => {
    this.setState({
      message: event.target.value
    });
  }

  private handleKeyUp: React.KeyboardEventHandler<HTMLTextAreaElement> = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.handleSend();
    }
  }

  private handleSend = () => {
    const action: Omit<MessageAction, 'player' | 'time'> = {
      type: 'message',
      text: this.state.message,
    };
    this.props.playAction(action);
    this.setState({
      message: '',
    });
  }
}

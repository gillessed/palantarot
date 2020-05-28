import { Button, Intent } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';
import { Dispatchers } from '../../../services/dispatchers';
import './PlaySidebar.scss';

interface Props {
  player: string;
  dispatchers: Dispatchers;
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
    if (this.state.message.trim().length > 0) {
      this.props.dispatchers.ingame.play(this.props.player).sendMessage(this.state.message);
      this.setState({
        message: '',
      });
    }
  }
}

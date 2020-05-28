import * as React from 'react';
import { Player } from '../../../../server/model/Player';
import { MessageAction, PlayerEvent } from '../../../play/common';
import { Dispatchers } from '../../../services/dispatchers';
import { InGameState } from '../../../services/ingame/InGameTypes';
import { PlayMessage } from './PlayMessage';
import { PlayMessageInput } from './PlayMessageInput';
import './PlaySidebar.scss';

interface Props {
  playerId: string;
  players: Map<string, Player>;
  game: InGameState;
  dispatchers: Dispatchers;
}

export class PlaySidebar extends React.PureComponent<Props> {
  public render() {
    return (
      <div className='play-sidebar'>
        <div className='message-container'>
          {...this.props.game.events.map(this.renderMessage)}
        </div>
        <PlayMessageInput
          player = {this.props.game.player}
          dispatchers={this.props.dispatchers}
        />
      </div>
    );
  }

  private renderMessage = (event: PlayerEvent, index: number) => {
    if (event.type != 'message') {
      return null;
    }
    return (
      <PlayMessage
        playerId={this.props.playerId}
        message={event as MessageAction}
        key={index}
      />
    );
  }
}

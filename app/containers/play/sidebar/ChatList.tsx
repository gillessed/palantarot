import React from 'react';
import { Player } from '../../../../server/model/Player';
import { PlayerId } from '../../../../server/play/model/GameState';
import { ChatText, ServerChatAuthorId } from '../../../../server/play/room/ChatText';
import { ClientGame } from '../../../services/room/ClientGame';
import { ClientGameSelectors } from '../../../services/room/ClientGameSelectors';
import { ChatMessageListItem, isChatTextGroup } from '../../../services/room/RoomTypes';
import './ChatList.scss';
import { ChatMessage } from './ChatMessage';
import { GameEventMessage } from './GameEventMessage';

interface Props {
  players: Map<PlayerId, Player>;
  game: ClientGame;
  chat: ChatText[];
}

export class ChatList extends React.PureComponent<Props> {
  private messageDiv?: HTMLDivElement;

  public componentDidUpdate(prevProps: Props) {
    const currentChat = prevProps.chat;
    const nextChat = this.props.chat;
    if (this.messageDiv && currentChat.length < nextChat.length) {
      this.messageDiv.scrollTop = this.messageDiv.scrollHeight;
    }
  }

  public render() {
    return (
      <div className='sidebar-chat-list list-container' ref={this.setRef}>
        {this.renderMessages()}
      </div>
    );
  }

  private setRef = (element: HTMLDivElement) => {
    if (element) {
      this.messageDiv = element;
    }
  }

  private renderMessages() {
    const groupedChatText = ClientGameSelectors.getGroupedChatText(this.props.chat);
    return groupedChatText.map(this.renderMessage);
  }

  private renderMessage = (item: ChatMessageListItem) => {
    const { players, game } = this.props;
    if (item.authorId === ServerChatAuthorId && !isChatTextGroup(item)) {
      return <GameEventMessage key={item.id} players={players} item={item} />;
    } else {
      return (
        <ChatMessage
          key={item.id}
          game={game}
          item={item}
          players={players}
        />
      )
    }
  }
}

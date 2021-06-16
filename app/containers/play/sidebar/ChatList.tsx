import * as React from 'react';
import { Player } from '../../../../server/model/Player';
import { ChatText, ServerChatAuthorId } from '../../../../server/play/room/ChatText';
import { ClientGame } from '../../../services/room/ClientGame';
import { ClientGameSelectors } from '../../../services/room/ClientGameSelectors';
import { ChatMessageListItem, isChatTextGroup } from '../../../services/room/RoomTypes';
import { GameEventMessage } from './GameEventMessage';
import { PlayMessage } from './PlayMessage';
import './PlaySidebar.scss';

interface Props {
  players: Map<string, Player>;
  game: ClientGame;
  chat: ChatText[];
}

export class ChatList extends React.PureComponent<Props> {
  private messageDiv: HTMLDivElement;

  public componentDidUpdate(nextProps: Props) {
    const currentChat = this.props.chat;
    const nextChat = nextProps.chat;
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
      return <GameEventMessage key={item.time} item={item} />;
    } else {
      return (
        <PlayMessage
          game={game}
          item={item}
          players={players}
          key={item.id}
        />
      )
    }
    // switch (event.type) {
    //   case 'bid':
    //     const bidEvent = event as BidAction;
    //     const bidRussian = (bidEvent.calls?.indexOf(Call.RUSSIAN) ?? -1) >= 0;
    //     const bidderName = getPlayerName(players.get(bidEvent.player));
    //     const bidMessage = bidEvent.bid === BidValue.PASS
    //       ? `${bidderName} passed`
    //       : `${bidderName} bid ${bidRussian ? 'russian 20' : bidEvent.bid}`;
    //     return <GameEventMessage key={index} message={bidMessage} />;
    //   case 'bidding_completed':
    //     const biddingCompletedTransition = event as BiddingCompletedTransition;
    //     const biddingCompletedWinner = biddingCompletedTransition.winning_bid.player;
    //     const biddingCompletedPlayerName = getPlayerName(players.get(biddingCompletedWinner));
    //     const biddingCompletedMessage = `${biddingCompletedPlayerName} has won the bid`;
    //     return <GameEventMessage key={index} message={biddingCompletedMessage} />;
    //   case 'call_partner':
    //     const callEvent = event as CallPartnerAction;
    //     const callPlayerName = getPlayerName(players.get(callEvent.player));
    //     const callMessage = `${callPlayerName} has called ${getCardText(callEvent.card)}`
    //     return <GameEventMessage key={index} message={callMessage} />;
    //   default: return null;
    // }
  }
}

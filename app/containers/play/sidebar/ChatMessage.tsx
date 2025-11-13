import { Icon } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import React from "react";
import { Player } from "../../../../server/model/Player";
import { ChatText } from "../../../../server/play/room/ChatText";
import { parseMessageForEmojis } from "../../../components/emoji/emojiRenderer";
import { getPlayerName } from "../../../services/utils/playerName";
import { ClientGame } from "../../../services/room/ClientGame";
import {
  ChatMessageListItem,
  isChatTextGroup,
} from "../../../services/room/RoomTypes";

interface Props {
  game: ClientGame;
  item: ChatMessageListItem;
  players: Map<string, Player>;
}

export class ChatMessage extends React.PureComponent<Props> {
  private renderTextLine(text: string, index: number) {
    return (
      <div className="message-body" key={index}>
        {parseMessageForEmojis(text)}
      </div>
    );
  }

  public render() {
    const { item, game, players } = this.props;

    const isParticipant =
      game.playState.playerOrder.indexOf(item.authorId) >= 0;
    const isYou = game.playerId === item.authorId;
    const player = players.get(item.authorId);
    const authorName = getPlayerName(player);

    return (
      <div className="play-message-container event-child">
        <div className="message-author">
          <Icon
            icon={isParticipant ? IconNames.PERSON : IconNames.EYE_OPEN}
            color={isYou ? "#0F9960" : isParticipant ? "#137CBD" : "#F5F8FA"}
          />
          <div className="message-author-text">{authorName}</div>
        </div>
        {isChatTextGroup(item) &&
          item.chat.map((chat: ChatText, index: number) => {
            return this.renderTextLine(chat.text, index);
          })}
        {!isChatTextGroup(item) && this.renderTextLine(item.text, 0)}
      </div>
    );
  }
}

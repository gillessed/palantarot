import React from "react";
import { Player } from "../../../../server/model/Player";
import { PlayerId } from "../../../../server/play/model/GameState";
import { ChatText } from "../../../../server/play/room/ChatText";
import { getPlayerName } from "../../../services/players/playerName";

interface Props {
  players: Map<PlayerId, Player>;
  item: ChatText;
}

export class GameEventMessage extends React.PureComponent<Props> {
  public render() {
    const { players, item } = this.props;
    const { text } = item;
    const replacedText = text.replace(/{([0-9]*)}/g, (_: string, playerId: string, playerId2: string) => {
      const player = players.get(playerId);
      return getPlayerName(player);
    });
    return <div className="game-event-message event-child">{replacedText}</div>;
  }
}

import React from "react";
import { defaultMemoize } from "reselect";
import { Player } from "../../../../../server/model/Player";
import { PlayerId } from "../../../../../server/play/model/GameState";
import { PlayerStatus } from "../../../../../server/play/room/PlayerStatus";
import { Dispatchers } from "../../../../services/dispatchers";
import { getPlayerName } from "../../../../services/players/playerName";
import "./PlayerList.scss";
import { PlayerRow } from "./PlayerRow";

interface Props {
  selfId: string;
  players: Map<PlayerId, Player>;
  gamePlayers: PlayerId[];
  playerStatuses: Map<PlayerId, PlayerStatus>;
  dispatchers: Dispatchers;
}

export enum SidebarTab {
  Chat,
  Players,
  Settings,
}

interface State {
  sidebarTab: SidebarTab;
}

interface PlayerItem {
  id: PlayerId;
  isYou: boolean;
  isParticipant: boolean;
  name: string;
  status: PlayerStatus;
  isBot: boolean;
}

const playerItemComparator = (p1: PlayerItem, p2: PlayerItem) => {
  return p1.name.localeCompare(p2.name);
};

export class PlayerList extends React.PureComponent<Props, State> {
  public state: State = {
    sidebarTab: SidebarTab.Chat,
  };

  private getPlayerItems = ({ selfId, players, gamePlayers, playerStatuses }: Props): PlayerItem[] => {
    const allPlayerIds = [...playerStatuses.keys()];
    const gamePlayersSet = new Set(gamePlayers);
    const playerItems: PlayerItem[] = [];
    for (const playerId of allPlayerIds) {
      const player = players.get(playerId);
      if (player?.isBot) {
        continue;
      }
      const isParticipant = gamePlayersSet.has(playerId);
      playerItems.push({
        id: playerId,
        isYou: playerId === selfId,
        isParticipant,
        name: getPlayerName(player),
        status: playerStatuses.get(playerId) ?? PlayerStatus.Offline,
        isBot: false,
      });
    }
    return playerItems;
  };

  private getOnlinePlayerItems = defaultMemoize((props: Props): PlayerItem[] => {
    const playerItems = this.getPlayerItems(props);
    const onlinePlayers = playerItems.filter((player) => player.status === PlayerStatus.Online);
    onlinePlayers.sort(playerItemComparator);
    return onlinePlayers;
  });

  private getOfflinePlayerItems = defaultMemoize((props: Props): PlayerItem[] => {
    const playerItems = this.getPlayerItems(props);
    const onlinePlayers = playerItems.filter((player) => player.status === PlayerStatus.Offline);
    onlinePlayers.sort(playerItemComparator);
    return onlinePlayers;
  });

  private getBotPlayers = defaultMemoize(({ players, gamePlayers }: Props): PlayerItem[] => {
    const gamePlayersSet = new Set(gamePlayers);
    const bots: Player[] = [];
    for (const playerId of players.keys()) {
      const player = players.get(playerId);
      if (player?.isBot) {
        bots.push(player);
      }
    }
    const botItems = bots.map((player) => ({
      id: player.id,
      isYou: false,
      isParticipant: gamePlayersSet.has(player.id),
      name: getPlayerName(player),
      status: PlayerStatus.Online,
      isBot: true,
    }));
    botItems.sort(playerItemComparator);
    return botItems;
  });

  public render() {
    const onlinePlayers = this.getOnlinePlayerItems(this.props);
    const offlinePlayers = this.getOfflinePlayerItems(this.props);
    const bots = this.getBotPlayers(this.props);
    return (
      <div className="sidebar-player-list list-container">
        <div className="unselectable sidebar-player-list-title">Online</div>
        {onlinePlayers.map(this.renderPlayer)}
        <div className="unselectable sidebar-player-list-title offline">Offline</div>
        {offlinePlayers.map(this.renderPlayer)}
        <div className="unselectable sidebar-player-list-title offline">Bots</div>
        {bots.map(this.renderPlayer)}
      </div>
    );
  }

  private renderPlayer = ({ id, isYou, isParticipant, name, status, isBot }: PlayerItem) => {
    return (
      <PlayerRow
        key={id}
        id={id}
        isYou={isYou}
        isParticipant={isParticipant}
        name={name}
        status={status}
        isBot={isBot}
        dispatchers={this.props.dispatchers}
      />
    );
  };
}

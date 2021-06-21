import { Colors, Icon } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';
import { defaultMemoize } from 'reselect';
import { Player } from '../../../../server/model/Player';
import { PlayerId } from '../../../../server/play/model/GameState';
import { PlayerStatus } from '../../../../server/play/room/PlayerStatus';
import { getPlayerName } from '../../../services/players/playerName';
import './PlayerList.scss';

interface Props {
  selfId: string;
  players: Map<PlayerId, Player>;
  gamePlayers: PlayerId[];
  playerStatuses: Map<PlayerId, PlayerStatus>;
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
  status: PlayerStatus
}

const playerItemComparator = (p1: PlayerItem, p2: PlayerItem) => {
  if (p1.isParticipant !== p2.isParticipant) {
    if (p1.isParticipant && !p2.isParticipant) {
      return -1;
    } else {
      return 1;
    }
  } else {
    return p1.name.localeCompare(p2.name);
  }
}

export class PlayerList extends React.PureComponent<Props, State> {
  public state: State = {
    sidebarTab: SidebarTab.Chat,
  };

  private getPlayerItems = defaultMemoize(({ selfId, players, gamePlayers, playerStatuses }: Props): PlayerItem[] => {
    const allPlayerIds = [...playerStatuses.keys()];
    const gamePlayersSet = new Set(gamePlayers);
    const playerItems: PlayerItem[] = [];
    for (const playerId of allPlayerIds) {
      const isParticipant = gamePlayersSet.has(playerId);
      playerItems.push({
        id: playerId,
        isYou: playerId === selfId,
        isParticipant,
        name: getPlayerName(players.get(playerId)),
        status: playerStatuses.get(playerId) ?? PlayerStatus.Offline,
      });
    }
    return playerItems;
  });

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

  public render() {
    const onlinePlayers = this.getOnlinePlayerItems(this.props);
    const offlinePlayers = this.getOfflinePlayerItems(this.props);
    return (
      <div className='sidebar-player-list list-container'>
        <div className='unselectable sidebar-player-list-title'>Online</div>
        {onlinePlayers.map(this.renderPlayer)}
        <div className='unselectable sidebar-player-list-title offline'>Offline</div>
        {offlinePlayers.map(this.renderPlayer)}
      </div>
    );
  }

  private renderPlayer = ({
    id,
    isYou,
    isParticipant,
    name,
    status,
  }: PlayerItem) => {
    const online = status === PlayerStatus.Online;
    return (
      <div key={id} className='player-row'>
        <Icon icon={IconNames.DOT} color={online ? Colors.FOREST4 : Colors.GRAY5} />
        {isParticipant && <Icon icon={IconNames.PERSON} color={Colors.BLUE5}/>}
        <span className='player-name unselectable'>{name} {isYou && ' (You)'}</span>
      </div>
    );
  }
}

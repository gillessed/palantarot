import { Icon } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';
import { Player } from '../../../../server/model/Player';
import { PlayerId } from '../../../../server/play/model/GameEvents';
import { PlayerStatus } from '../../../../server/play/room/PlayerStatus';
import { getPlayerName } from '../../../services/players/playerName';
import './PlaySidebar.scss';

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

export class PlayerList extends React.PureComponent<Props, State> {
  public state: State = {
    sidebarTab: SidebarTab.Chat,
  };

  public render() {
    const { playerStatuses } = this.props;
    const allPlayers = [...playerStatuses.keys()];
    return (
      <div className='sidebar-player-list list-container'>
        {allPlayers.map(this.renderPlayer)}
      </div>
    );
  }

  private renderPlayer = (playerId: PlayerId) => {
    const { selfId, players, gamePlayers, playerStatuses } = this.props;
    const gamePlayersSet = new Set(gamePlayers);
    const isParticipant = gamePlayersSet.has(playerId);
    const isYou = playerId === selfId;
    const playerName = getPlayerName(players.get(playerId));
    const playerStatus = playerStatuses.get(playerId) ?? PlayerStatus.Offline;
    //TODO is online
    return (
      <div key={playerId} className='player-row'>
        <Icon
          icon={isParticipant ? IconNames.PERSON : IconNames.EYE_OPEN}
          color={isYou ? '#0F9960' : isParticipant ? '#137CBD' : '#F5F8FA'}
        />
        <span className='player-name unselectable'>{playerName} {isYou && ' (You)'}</span>
      </div>
    );
  }
}

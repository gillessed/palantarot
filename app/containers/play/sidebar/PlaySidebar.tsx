import { Button, ButtonGroup, Intent } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';
import { Player } from '../../../../server/model/Player';
import history from '../../../history';
import { StaticRoutes } from '../../../routes';
import { Dispatchers } from '../../../services/dispatchers';
import { ClientRoom } from '../../../services/room/RoomTypes';
import { CardBackUrls } from '../svg/CardSvg';
import { AddBotButton } from './AddBotButton';
import { ChatInput } from './ChatInput';
import { ChatList } from './ChatList';
import { PlayerList } from './PlayerList';
import './PlaySidebar.scss';
import { SidebarActions } from './SidebarActions';

interface Props {
  playerId: string;
  players: Map<string, Player>;
  room: ClientRoom;
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

export class PlaySidebar extends React.PureComponent<Props, State> {
  public state: State = {
    sidebarTab: SidebarTab.Chat,
  };

  public render() {
    const { playerId, players, room } = this.props;
    const { sidebarTab } = this.state;
    return (
      <div className='play-sidebar'>
        <div className='sidebar-header'>
          <img
            className='header-image'
            src={CardBackUrls.Blue}
          />
          <Button
            className='lobby-button'
            icon={IconNames.UNDO}
            onClick={this.returnToLobby}
            intent={Intent.PRIMARY}
          />
        </div>
        <ButtonGroup className='toggle-button-group bp3-dark' fill>
          <Button
            className='toggle-messages-button'
            icon={IconNames.PROPERTIES}
            active={sidebarTab === SidebarTab.Chat}
            onClick={this.setSidebarTabChat}
          />
          <Button
            className='toggle-players-button'
            icon={IconNames.PEOPLE}
            active={sidebarTab === SidebarTab.Players}
            onClick={this.setSidebarTabPlayers}
          />
        </ButtonGroup>
        {sidebarTab === SidebarTab.Chat && <ChatList
          players={players}
          game={room.game}
          chat={room.chat}
        />}
        {sidebarTab === SidebarTab.Players && <PlayerList
          selfId={playerId}
          players={players}
          gamePlayers={room.game.playState.playerOrder}
          playerStatuses={room.players}
        />}
        <ChatInput
          player={this.props.room.playerId}
          dispatchers={this.props.dispatchers}
        />
        <SidebarActions
          room={this.props.room}
          dispatchers={this.props.dispatchers}
        />
        <AddBotButton
          game={this.props.room.game}
          dispatchers={this.props.dispatchers}
          players={this.props.players}
        />
      </div>
    );
  }

  private setSidebarTabChat = () => {
    this.setState({ sidebarTab: SidebarTab.Chat });
  }

  private setSidebarTabPlayers = () => {
    this.setState({ sidebarTab: SidebarTab.Players });
  }

  private returnToLobby = () => {
    history.push(StaticRoutes.lobby());
  }
}

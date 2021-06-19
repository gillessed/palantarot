import { Button, Classes, HTMLTable, Intent } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import React from "react";
import { connect } from 'react-redux';
import { Player } from '../../../server/model/Player';
import { RoomDescription } from '../../../server/play/room/RoomDescription';
import { loadContainer } from "../../containers/LoadingContainer";
import history from '../../history';
import { DynamicRoutes } from "../../routes";
import { Dispatchers } from "../../services/dispatchers";
import { GamePlayer } from '../../services/gamePlayer/GamePlayerTypes';
import { lobbyLoader } from '../../services/lobby/LobbyService';
import { playersLoader } from '../../services/players/index';
import { getPlayerName } from '../../services/players/playerName';
import { ReduxState } from '../../services/rootReducer';
import { RoomCreationDialog } from './CreateRoomDialog';
import './LobbyContainer.scss';
import { LobbyPlayerDialog } from "./LobbyPlayerDialog";
import { RoomRow } from "./RoomRow";

interface OwnProps {
  rooms: Map<string, RoomDescription>;
  players: Map<string, Player>;
  dispatchers: Dispatchers;
}

interface StoreProps {
  gamePlayer: GamePlayer | null;
}

type Props = OwnProps & StoreProps;

interface State {
  isPlayerDialogOpen: boolean;
  isGameSettingsDialogOpen: boolean;
}

class LobbyInternal extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    const validPlayerId = props.gamePlayer != null && props.players.has(props.gamePlayer.playerId);
    this.state = {
      isPlayerDialogOpen: !validPlayerId,
      isGameSettingsDialogOpen: false,
    };
  }
  public componentWillMount() {
    const { gamePlayer, dispatchers } = this.props;
    if (gamePlayer != null) {
      dispatchers.lobby.socketConnect(gamePlayer?.playerId);
    }
  }

  public componentWillUnmount(): void {
    this.props.dispatchers.lobby.socketClose();
  }

  public render() {
    const { gamePlayer, players } = this.props;
    const player = gamePlayer ? players.get(gamePlayer.playerId) : undefined;
    return (
      <div className='page-container'>
        <h1 className='bp3-heading'>
          Lobby
        </h1>
        <Button
          className='user-select-button'
          icon={IconNames.USER}
          onClick={this.openPlayerDialog}
          text={player ? getPlayerName(player) : ''}
          intent={Intent.SUCCESS}
        />
        <Button
          className='new-room-button'
          icon={IconNames.ADD}
          onClick={this.newRoom}
          text='New Room'
          intent={Intent.PRIMARY}
        />
        {player && this.renderRooms()}
        <LobbyPlayerDialog
          isOpen={this.state.isPlayerDialogOpen}
          playerId={player?.id}
          players={this.props.players}
          onConfirm={this.handlePlayerConfirmed}
          onClose={this.closePlayerDialog}
        />
        <RoomCreationDialog
          isOpen={this.state.isGameSettingsDialogOpen}
          onClose={this.closeGameSettingsDialog}
          dispatchers={this.props.dispatchers}
        />
      </div>
    )
  }

  private renderRooms = () => {
    const { rooms, gamePlayer, players } = this.props;
    const roomList = [...rooms.values()];
    // TODO: sort rooms
    if (roomList.length === 0) {
      return (
        <div className='no-rooms-container'>
          <h4 className={Classes.HEADING}>There currently no rooms. Press 'New Room' to start a new room.</h4>
        </div>
      );
    }
    return (
      <HTMLTable>
        <thead>
          <tr>
            <th>Name</th>
            <th>Join Room</th>
            <th>Players</th>
            <th>State</th>
            <th>Settings</th>
          </tr>
        </thead>
        <tbody>
          {roomList.map((room) => (
            <RoomRow
              key={room.id}
              room={room}
              gamePlayer={gamePlayer}
              players={players}
              enterRoom={this.enterRoom}
            />
          ))}
        </tbody>
      </HTMLTable>
    );
  }

  private openPlayerDialog = () => {
    this.setState({ isPlayerDialogOpen: true });
  }

  private closePlayerDialog = () => {
    this.setState({ isPlayerDialogOpen: false });
  }

  private handlePlayerConfirmed = (playerId: string) => {
    const validPlayerId = this.props.players.has(playerId);
    if (validPlayerId) {
      this.props.dispatchers.gamePlayer.set({ playerId });
      //TODO: disconnect old socket if there is one
      this.props.dispatchers.lobby.socketConnect(playerId);
      this.setState({
        isPlayerDialogOpen: false,
      });
    }
  }
  private newRoom = () => {
    this.setState({ isGameSettingsDialogOpen: true });
  };

  private enterRoom = (roomId: string) => {
    if (this.props.gamePlayer) {
      history.push(DynamicRoutes.play(roomId));
    }
  };

  private closeGameSettingsDialog = () => {
    this.setState({ isGameSettingsDialogOpen: false });
  }
}

const mapStateToProps = (state: ReduxState) => {
  return {
    gamePlayer: state.gamePlayer,
  };
};

const connectRedux = connect<StoreProps, {}, OwnProps>(mapStateToProps);

export const LobbyContainer = loadContainer({
  rooms: lobbyLoader,
  players: playersLoader,
}, { hideSpinnerOnReload: true })(connectRedux(LobbyInternal));

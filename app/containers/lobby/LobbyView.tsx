import { Button, Stack, Text } from "@mantine/core";
import { IconCirclePlus, IconUser } from "@tabler/icons-react";
import { memo } from "react";
import { Player } from "../../../server/model/Player";
import {
  useGamePlayerId,
  useOpenGamePlayerDialog,
} from "../../context/GamePlayerIdContext";
import { RoomsContainer } from "./RoomsContainer";
import { useDisclosure } from "@mantine/hooks";
import { CreateRoomDialog } from "./CreateRoomDialog";

interface Props {
  players: Map<string, Player>;
}

export const LobbyView = memo(function LobbyView({ players }: Props) {
  const [dialogOpen, { close: closeDialog, open: openDialog }] =
    useDisclosure(false);
  const gamePlayerId = useGamePlayerId();
  const openGamePlayerDialog = useOpenGamePlayerDialog();
  const gamePlayer = gamePlayerId ? players.get(gamePlayerId) : undefined;

  if (gamePlayer == null) {
    return (
      <Stack align="center">
        <Text>
          You must select a player to play as before you can join a game.
        </Text>
        <Button
          color="blue"
          leftSection={<IconUser />}
          onClick={openGamePlayerDialog}
        >
          Select
        </Button>
      </Stack>
    );
  }

  return (
    <Stack>
      <Button
        leftSection={<IconCirclePlus />}
        color="blue"
        w={150}
        onClick={openDialog}
      >
        New Room
      </Button>
      <RoomsContainer gamePlayerId={gamePlayerId} players={players} />
      <CreateRoomDialog onClose={closeDialog} opened={dialogOpen} />
    </Stack>
  );
});

//   public render() {
//     const { gamePlayer, players } = this.props;
//     const player = gamePlayer ? players.get(gamePlayer.playerId) : undefined;
//     return (
//       <div className="page-container">
//         <h1 className="bp3-heading">Lobby</h1>
//         <Button
//           className="user-select-button"
//           icon={IconNames.USER}
//           onClick={this.openPlayerDialog}
//           text={player ? getPlayerName(player) : ""}
//           intent={Intent.SUCCESS}
//         />
//         <Button
//           className="new-room-button"
//           icon={IconNames.ADD}
//           onClick={this.newRoom}
//           text="New Room"
//           intent={Intent.PRIMARY}
//         />
//         {player && this.renderRooms()}
//         <RoomCreationDialog
//           isOpen={this.state.isGameSettingsDialogOpen}
//           onClose={this.closeGameSettingsDialog}
//           dispatchers={this.props.dispatchers}
//         />
//       </div>
//     );
//   }

//   private renderRooms = () => {
//     const { rooms, gamePlayer, players } = this.props;
//     const roomList = [...rooms.values()];:Wq
//     // TODO: sort rooms
//     if (roomList.length === 0) {
//       return (
//         <div className="no-rooms-container">
//           <h4 className={Classes.HEADING}>
//             There currently no rooms. Press 'New Room' to start a new room.
//           </h4>
//         </div>
//       );
//     }
//     return (
//       <HTMLTable>
//         <thead>
//           <tr>
//             <th>Name</th>
//             <th>Join Room</th>
//             <th>Players Online</th>
//             <th>State</th>
//             <th>Settings</th>
//           </tr>
//         </thead>
//         <tbody>
//           {roomList.map((room) => (
//             <RoomRow
//               key={room.id}
//               room={room}
//               gamePlayer={gamePlayer}
//               players={players}
//               enterRoom={this.enterRoom}
//             />
//           ))}
//         </tbody>
//       </HTMLTable>
//     );
//   };

//   private openPlayerDialog = () => {
//     this.setState({ isPlayerDialogOpen: true });
//   };

//   private closePlayerDialog = () => {
//     this.setState({ isPlayerDialogOpen: false });
//   };

//   private handlePlayerConfirmed = (playerId: string) => {
//     const validPlayerId = this.props.players.has(playerId);
//     if (validPlayerId) {
//       this.props.dispatchers.gamePlayer.set({ playerId });
//       //TODO: disconnect old socket if there is one
//       this.props.dispatchers.lobby.socketConnect(playerId);
//       this.setState({
//         isPlayerDialogOpen: false,
//       });
//     }
//   };
//   private newRoom = () => {
//     this.setState({ isGameSettingsDialogOpen: true });
//   };

//   private enterRoom = (roomId: string) => {
//     if (this.props.gamePlayer) {
//       history.push(DynamicRoutes.play(roomId));
//     }
//   };

//   private closeGameSettingsDialog = () => {
//     this.setState({ isGameSettingsDialogOpen: false });
//   };
// }

// const mapStateToProps = (state: ReduxState) => {
//   return {
//     gamePlayer: state.gamePlayer,
//   };
// };

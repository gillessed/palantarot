import { TypedAction } from 'redoodle';
import { NewRoomArgs } from '../../../server/play/room/NewRoomArgs';
import { RoomDescription } from '../../../server/play/room/RoomDescription';
import { lobbyService } from './LobbyService';

const newRoom = TypedAction.define("LOBBY // NEW ROOM")<NewRoomArgs>();
const roomUpdate = TypedAction.define("LOBBY // ROOM UPDATE")<RoomDescription>();

export const LobbyActions = {
  ...lobbyService.actions,
  newRoom,
  roomUpdate,
};

import { TypedAction } from 'redoodle';
import { NewRoomArgs } from '../../../server/play/room/NewRoomArgs';
import { RoomDescription } from '../../../server/play/room/RoomDescription';
import { actionName } from '../redux/actionName';
import { lobbyService } from './LobbyService';

const name = actionName('lobby');
const newRoom = TypedAction.define(name('newRoom'))<NewRoomArgs>();
const roomUpdate = TypedAction.define(name('roomUpdate'))<RoomDescription>();

export const LobbyActions = {
  ...lobbyService.actions,
  newRoom,
  roomUpdate,
};

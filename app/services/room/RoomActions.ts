import { TypedAction } from 'redoodle';
import { Action } from '../../../server/play/model/GameEvents';
import { ChatText } from '../../../server/play/room/ChatText';
import { roomSocketService } from './RoomSagas';
import { GameUpdatesPayload, JoinRoomPayload, NewGameInfo, RoomStatusPayload } from './RoomTypes';

const roomStatus = TypedAction.define("ROOM // STATUS")<RoomStatusPayload>();
const gameAction = TypedAction.define("ROOM // GAME ACTION")<Action>();
const error = TypedAction.define("ROOM // ERROR")<Action>();
const gameUpdate = TypedAction.define("ROOM // GAME UPDATE")<GameUpdatesPayload>();
const addBot = TypedAction.define("ROOM // ADD BOT")<string>();
const removeBot = TypedAction.define("ROOM // REMOVE BOT")<string>();
const chatReceived = TypedAction.define("ROOM //CHAT RECEIVED")<ChatText>();
const sendChat = TypedAction.define("ROOM // SEND CHAT")<string>();
const closeShowWindow = TypedAction.define("PLAY // CLOSE SHOW INWDOW")<void>();
const setAutoplay = TypedAction.define("PLAY // SET AUTOPLAY")<boolean>();
const newGameCreated = TypedAction.define("ROOM // NEW GAME CREATED")<NewGameInfo>();
const moveToNewGame = TypedAction.define("ROOM // MOVE TO NEW GAME")<void>();
export const RoomActions = {
  roomStatus,
  gameAction,
  error,
  gameUpdate,
  chatReceived,
  sendChat,
  exit: roomSocketService.actions.close,
  addBot,
  removeBot,
  closeShowWindow,
  setAutoplay,
  newGameCreated,
  moveToNewGame,
};

const debugJoinGame = TypedAction.define("DEBUG PLAY // JOIN")<JoinRoomPayload>();
const debugPlayAction = TypedAction.define("DEBUG PLAY // ACTION")<Action>();
const autoplay = TypedAction.define("DEBUG PLAY // AUTOPLAY")<void>();
export const DebugRoomActions = {
  debugJoinGame,
  debugPlayAction,
  autoplay,
};

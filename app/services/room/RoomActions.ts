import { TypedAction } from 'redoodle';
import { Action } from '../../../server/play/model/GameEvents';
import { ChatText } from '../../../server/play/room/ChatText';
import { actionName } from '../redux/actionName';
import { GameUpdatesPayload, NewGameInfo, RoomStatusPayload, SetPlayerStatusPayload } from './RoomTypes';

const name = actionName('room');

const roomStatus = TypedAction.define(name('roomStatus'))<RoomStatusPayload>();
const gameAction = TypedAction.define(name('gameAction'))<Action>();
const error = TypedAction.define(name('error'))<Action>();
const gameUpdate = TypedAction.define(name('gameUpdate'))<GameUpdatesPayload>();
const addBot = TypedAction.define(name('addBot'))<string>();
const removeBot = TypedAction.define(name('removeBot'))<string>();
const chatReceived = TypedAction.define(name('chatReceived'))<ChatText>();
const sendChat = TypedAction.define(name('sendChat'))<string>();
const closeShowWindow = TypedAction.define(name('closeShowWindow'))<void>();
const newGameCreated = TypedAction.define(name('newGameCreated'))<NewGameInfo>();
const moveToNewGame = TypedAction.define(name('moveToNewGame'))<void>();
const setPlayerStatus = TypedAction.define(name('setPlayerStatus'))<SetPlayerStatusPayload>();
const setAutopass = TypedAction.define(name('setAutopass'))<boolean>();
const setAutoplay = TypedAction.define(name('setAutoplay'))<boolean>();
const autoplay = TypedAction.define(name('autoplay'))<SetPlayerStatusPayload>();
export const RoomActions = {
  roomStatus,
  gameAction,
  error,
  gameUpdate,
  chatReceived,
  sendChat,
  addBot,
  removeBot,
  closeShowWindow,
  newGameCreated,
  moveToNewGame,
  setPlayerStatus,
  setAutopass,
  setAutoplay,
  autoplay,
};

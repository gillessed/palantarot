import { defineSocketMessage } from '../../websocket/SocketMessage';
import { Action, ErrorCode, PlayerEvent } from '../model/GameEvents';
import { GameSettings } from '../model/GameSettings';
import { ChatText } from './ChatText';
import { PlayerStatus } from './PlayerStatus';
import { RoomStatus } from './RoomStatus';

export interface EnterRoomMessagePayload {
  roomId: string;
  playerId: string;
}

export interface PlayerStatusUpdatedMessagePayload {
  roomId: string;
  playerId: string;
  playerStatus: PlayerStatus;
  time: number;
}

export interface RoomChatMessagePayload {
  roomId: string;
  chat: ChatText;  
}

export interface GameActionMessagePayload {
  roomId: string;
  playerId: string;
  action: Action;
}

export interface GameUpdatesMessagePayload {
  roomId: string;
  gameId: string;
  events: PlayerEvent[];
}

export interface RoomErrorMessagePayload {
  roomId: string;
  error: string;
  errorCode?: ErrorCode;
}

export interface NewGameMessagePayload {
  roomId: string;
  gameId: string;
  settings: GameSettings;
}

export interface BotMessagePayload {
  roomId: string;
  botId: string;
}

export interface AutoplayMessagePayload {
  roomId: string;
}

export interface RoomStatusMessagePayload {
  roomId: string;
  room: RoomStatus;
}

export interface NotifyPlayerMessagePayload {
  roomId: string;
  playerId: string;
}

const name = (method: string) => `room::${method}`;

const enterRoom = defineSocketMessage<EnterRoomMessagePayload>(name('enterRoom'));
const roomStatus = defineSocketMessage<RoomStatusMessagePayload>(name('roomStatus'));
const playerStatusUpdated = defineSocketMessage<PlayerStatusUpdatedMessagePayload>(name('playerStatusUpdated'));
const roomChat = defineSocketMessage<RoomChatMessagePayload>(name('roomChat'));
const gameAction = defineSocketMessage<GameActionMessagePayload>(name('gameAction'));
const gameUpdates = defineSocketMessage<GameUpdatesMessagePayload>(name('gameUpdates'));
const error = defineSocketMessage<RoomErrorMessagePayload>(name('error'));
const newGame = defineSocketMessage<NewGameMessagePayload>(name('newGame'));
const addBot = defineSocketMessage<BotMessagePayload>(name('adBot'));
const removeBot = defineSocketMessage<BotMessagePayload>(name('removeBot'));
const autoplay = defineSocketMessage<AutoplayMessagePayload>(name('autoplay'));
const notifyPlayer = defineSocketMessage<NotifyPlayerMessagePayload>(name('notifyPlayer'));

export const RoomSocketMessages = {
  enterRoom,
  roomStatus,
  playerStatusUpdated,
  roomChat,
  gameAction,
  gameUpdates,
  error,
  newGame,
  addBot,
  removeBot,
  autoplay,
  notifyPlayer,
};

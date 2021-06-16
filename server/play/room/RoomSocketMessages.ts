import { SocketMessage } from '../../websocket/SocketMessage';
import { Action, ErrorCode, PlayerEvent } from '../model/GameEvents';
import { GameSettings } from '../model/GameSettings';
import { ChatText } from './ChatText';
import { PlayerStatus } from './PlayerStatus';
import { RoomStatus } from './RoomStatus';

export const RoomSocketMessageType = 'room';
export interface RoomSocketMessage extends SocketMessage {
  type: typeof RoomSocketMessageType;
  messageType: string;
  roomId: string;
}

export const EnterRoomMessageType = 'enter_room';
export interface EnterRoomMessage extends RoomSocketMessage {
  messageType: typeof EnterRoomMessageType;
  playerId: string;
}

export const RoomStatusMessageType = 'room_status';
export interface RoomStatusMessage extends RoomSocketMessage {
  messageType: typeof RoomStatusMessageType;
  room: RoomStatus;
}

export const PlayerStatusUpdatedMessageType = 'player_status_update';
export interface PlayerStatusUpdatedMessage extends RoomSocketMessage {
  messageType: typeof PlayerStatusUpdatedMessageType;
  playerId: string;
  playerStatus: PlayerStatus;
  time: number;
}

export const RoomChatMessageType = 'room_chat';
export interface RoomChatMessage extends RoomSocketMessage {
  messageType: typeof RoomChatMessageType;
  chat: ChatText;
}

export const GameActionMessageType = 'game_action';
export interface GameActionMessage extends RoomSocketMessage {
  messageType: typeof GameActionMessageType;
  playerId: string;
  action: Action;
}

export const GameUpdatesMessageType = 'game_updates';
export interface GameUpdatesMessage extends RoomSocketMessage {
  messageType: typeof GameUpdatesMessageType;
  gameId: string;
  events: PlayerEvent[];
}

export const RoomErrorMessageType = 'room_error';
export interface RoomErrorMessage extends RoomSocketMessage {
  messageType: typeof RoomErrorMessageType;
  error: string;
  errorCode?: ErrorCode;
}

export const NewGameMessageType = 'new_game';
export interface NewGameMessage extends RoomSocketMessage {
  messageType: typeof NewGameMessageType;
  settings: GameSettings;
  gameId: string;
}

export const AddBotMessageType = 'add_bot';
export interface AddBotMessage extends RoomSocketMessage {
  messageType: typeof AddBotMessageType;
  botId: string;
}

export const RemoveBotMessageType = 'remove_bot';
export interface RemoveBotMessage extends RoomSocketMessage {
  messageType: typeof RemoveBotMessageType;
  botId: string;
}

export const AutoplayMessageType = 'autoplay';
export interface AutoplayMessage extends RoomSocketMessage {
  messageType: typeof AutoplayMessageType;
}

export const RoomSocketMessages = {
  enterRoom: (roomId: string, playerId: string): EnterRoomMessage => ({
    type: RoomSocketMessageType,
    messageType: EnterRoomMessageType,
    roomId,
    playerId,
  }),
  roomStatus: (roomId: string, room: RoomStatus): RoomStatusMessage => ({
    type: RoomSocketMessageType,
    messageType: RoomStatusMessageType,
    roomId,
    room,
  }),
  playerStatusUpdated: (roomId: string, playerId: string, playerStatus: PlayerStatus): PlayerStatusUpdatedMessage => ({
    type: RoomSocketMessageType,
    messageType: PlayerStatusUpdatedMessageType,
    roomId,
    playerId,
    playerStatus,
    time: Date.now(),
  }),
  chatMessage: (roomId: string, id: string, text: string, authorId: string): RoomChatMessage => ({
    type: RoomSocketMessageType,
    messageType: RoomChatMessageType,
    roomId,
    chat: {
      id,
      text,
      authorId,
      time: Date.now(),
    },
  }),
  gameAction: (roomId: string, playerId: string, action: Action): GameActionMessage=> ({
    type: RoomSocketMessageType,
    messageType: GameActionMessageType,
    roomId,
    playerId,
    action,
  }),
  gameUpdates: (roomId: string, gameId: string, events: PlayerEvent[]): GameUpdatesMessage => ({
    type: RoomSocketMessageType,
    messageType: GameUpdatesMessageType,
    roomId,
    gameId,
    events,
  }),
  error: (roomId: string, error: string, errorCode?: ErrorCode): RoomErrorMessage => ({
    type: RoomSocketMessageType,
    messageType: RoomErrorMessageType,
    roomId,
    error,
    errorCode,
  }),
  newGame: (roomId: string, gameId: string, settings: GameSettings): NewGameMessage => ({
    type: RoomSocketMessageType,
    messageType: NewGameMessageType,
    roomId,
    gameId,
    settings,
  }),
  addBot: (roomId: string, botId: string): AddBotMessage => ({
    type: RoomSocketMessageType,
    messageType: AddBotMessageType,
    roomId,
    botId,
  }),
  removeBot: (roomId: string, botId: string): RemoveBotMessage => ({
    type: RoomSocketMessageType,
    messageType: RemoveBotMessageType,
    roomId,
    botId,
  }),
  autoplay: (roomId: string): AutoplayMessage => ({
    type: RoomSocketMessageType,
    messageType: AutoplayMessageType,
    roomId,
  }),
};

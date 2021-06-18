import { SocketMessage } from '../../websocket/SocketMessage';
import { Action, ErrorCode, PlayerEvent } from '../model/GameEvents';
import { GameSettings } from '../model/GameSettings';
import { ChatText } from './ChatText';
import { PlayerStatus } from './PlayerStatus';
import { RoomStatus } from './RoomStatus';

export namespace RoomSockets {

  export const MessageType = 'room';
  export type MessageType = typeof MessageType;
  interface MessageDef {
    readonly type: typeof MessageType;
    readonly messageType: string;
    roomId: string;
  }
  
  export type Message =
  | EnterRoomMessage
  | RoomStatusMessage
  | PlayerStatusUpdatedMessage
  | RoomChatMessage
  | GameActionMessage
  | GameUpdatesMessage
  | RoomErrorMessage
  | NewGameMessage
  | AddBotMessage
  | RemoveBotMessage
  | AutoplayMessage;

  export function isRoomSocketMessage(message: SocketMessage): message is Message {
    return message.type === MessageType;
  }

  export const EnterRoomMessageType = 'enter_room';
  export type EnterRoomMessageType = typeof EnterRoomMessageType;
  export interface EnterRoomMessage extends MessageDef {
    readonly messageType: EnterRoomMessageType;
    playerId: string;
  }
  export const enterRoom = (roomId: string, playerId: string): EnterRoomMessage => ({
    type: MessageType,
    messageType: EnterRoomMessageType,
    roomId,
    playerId,
  });

  export const RoomStatusMessageType = 'room_status';
  export type RoomStatusMessageType = typeof RoomStatusMessageType;
  export interface RoomStatusMessage extends MessageDef {
    messageType: RoomStatusMessageType;
    room: RoomStatus;
  }
  export const roomStatus = (roomId: string, room: RoomStatus): RoomStatusMessage => ({
    type: MessageType,
    messageType: RoomStatusMessageType,
    roomId,
    room,
  });

  export const PlayerStatusUpdatedMessageType = 'player_status_update';
  export type PlayerStatusUpdatedMessageType = typeof PlayerStatusUpdatedMessageType;
  export interface PlayerStatusUpdatedMessage extends MessageDef {
    messageType: PlayerStatusUpdatedMessageType;
    playerId: string;
    playerStatus: PlayerStatus;
    time: number;
  }
  export const playerStatusUpdated = (roomId: string, playerId: string, playerStatus: PlayerStatus): PlayerStatusUpdatedMessage => ({
    type: MessageType,
    messageType: PlayerStatusUpdatedMessageType,
    roomId,
    playerId,
    playerStatus,
    time: Date.now(),
  });

  export const RoomChatMessageType = 'room_chat';
  export type RoomChatMessageType = typeof RoomChatMessageType;
  export interface RoomChatMessage extends MessageDef {
    messageType: typeof RoomChatMessageType;
    chat: ChatText;
  }
  export const chatMessage = (roomId: string, id: string, text: string, authorId: string): RoomChatMessage => ({
    type: MessageType,
    messageType: RoomChatMessageType,
    roomId,
    chat: {
      id,
      text,
      authorId,
      time: Date.now(),
    },
  });

  export const GameActionMessageType = 'game_action';
  export type GameActionMessageType = typeof GameActionMessageType;
  export interface GameActionMessage extends MessageDef {
    messageType: GameActionMessageType;
    playerId: string;
    action: Action;
  }
  export const gameAction = (roomId: string, playerId: string, action: Action): GameActionMessage => ({
    type: MessageType,
    messageType: GameActionMessageType,
    roomId,
    playerId,
    action,
  });

  export const GameUpdatesMessageType = 'game_updates';
  export type GameUpdatesMessageType = typeof GameUpdatesMessageType;
  export interface GameUpdatesMessage extends MessageDef {
    messageType: GameUpdatesMessageType;
    gameId: string;
    events: PlayerEvent[];
  }
  export const gameUpdates = (roomId: string, gameId: string, events: PlayerEvent[]): GameUpdatesMessage => ({
    type: MessageType,
    messageType: GameUpdatesMessageType,
    roomId,
    gameId,
    events,
  });

  export const RoomErrorMessageType = 'room_error';
  export type RoomErrorMessageType = typeof RoomErrorMessageType;
  export interface RoomErrorMessage extends MessageDef {
    messageType: RoomErrorMessageType;
    error: string;
    errorCode?: ErrorCode;
  }
  export const error = (roomId: string, error: string, errorCode?: ErrorCode): RoomErrorMessage => ({
    type: MessageType,
    messageType: RoomErrorMessageType,
    roomId,
    error,
    errorCode,
  });

  export const NewGameMessageType = 'new_game';
  export type NewGameMessageType = typeof NewGameMessageType;
  export interface NewGameMessage extends MessageDef {
    messageType: NewGameMessageType;
    settings: GameSettings;
    gameId: string;
  }
  export const newGame = (roomId: string, gameId: string, settings: GameSettings): NewGameMessage => ({
    type: MessageType,
    messageType: NewGameMessageType,
    roomId,
    gameId,
    settings,
  });

  export const AddBotMessageType = 'add_bot';
  export type AddBotMessageType = typeof AddBotMessageType;
  export interface AddBotMessage extends MessageDef {
    messageType: AddBotMessageType;
    botId: string;
  }
  export const addBot = (roomId: string, botId: string): AddBotMessage => ({
    type: MessageType,
    messageType: AddBotMessageType,
    roomId,
    botId,
  });

  export const RemoveBotMessageType = 'remove_bot';
  export type RemoveBotMessageType = typeof RemoveBotMessageType;
  export interface RemoveBotMessage extends MessageDef {
    messageType: RemoveBotMessageType;
    botId: string;
  }
  export const removeBot = (roomId: string, botId: string): RemoveBotMessage => ({
    type: MessageType,
    messageType: RemoveBotMessageType,
    roomId,
    botId,
  });

  export const AutoplayMessageType = 'autoplay';
  export type AutoplayMessageType = typeof AutoplayMessageType;
  export interface AutoplayMessage extends MessageDef {
    messageType: typeof AutoplayMessageType;
  }
  export const autoplay = (roomId: string): AutoplayMessage => ({
    type: MessageType,
    messageType: AutoplayMessageType,
    roomId,
  });
};





export const test = () => {
  interface Foo {
    type: string;
  }

  interface Foo1 extends Foo {
    type: 'foo1';
    f1: number;
  }

  interface Foo2 extends Foo {
    type: 'foo2';
    f2: number;
  }

  const take = (foo: Foo) => {
    switch (foo.type) {
      case 'foo1':
        foo.type
        break;
    }
  }
}

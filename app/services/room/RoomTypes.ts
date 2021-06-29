import { PlayerEvent } from '../../../server/play/model/GameEvents';
import { GameSettings } from '../../../server/play/model/GameSettings';
import { PlayerId } from '../../../server/play/model/GameState';
import { ChatText } from '../../../server/play/room/ChatText';
import { PlayerStatus } from '../../../server/play/room/PlayerStatus';
import { RoomStatus } from '../../../server/play/room/RoomStatus';
import { ClientGame } from './ClientGame';

export interface ClientRoom {
  // Server state
  id: string;
  name: string;
  color: string;
  playerId: PlayerId;
  players: Map<string, PlayerStatus>;
  settings: GameSettings;
  game: ClientGame;
  chat: ChatText[];
  nextGame?: ClientGame;

  // Client state
  autoplay: boolean;
  autopass: boolean;
}

export interface RoomStatusPayload {
  room: RoomStatus;
  playerId: string;
}

export interface JoinRoomPayload {
  roomId: string;
  playerId: string;
}

export interface ChatTextGroup {
  type: 'group'
  id: string;
  authorId: PlayerId;
  time: number;
  chat: ChatText[];
}

export interface NewGameInfo {
  gameId: string;
  gameSettings: GameSettings;
}

export interface GameUpdatesPayload {
  gameId: string;
  events: PlayerEvent[];
}

export interface SetPlayerStatusPayload {
  playerId: string;
  playerStatus: PlayerStatus;
}

export function isChatTextGroup(item: ChatMessageListItem): item is ChatTextGroup {
  return (item as ChatTextGroup).type === 'group';
}

export type ChatMessageListItem = ChatText | ChatTextGroup;

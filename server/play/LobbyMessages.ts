import { SocketMessage } from '../websocket/SocketMessage';
import { GameDescription } from './GameDescription';

export interface EnterLobbyMessage extends SocketMessage {
  type: 'lobby',
}

export interface LobbyUpdateMessage extends SocketMessage {
  type: 'lobby_update',
  game: GameDescription;
}

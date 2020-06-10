import { Action, ErrorCode, PlayerEvent, PlayerId } from '../../app/play/common';
import { SocketMessage } from '../websocket/SocketMessage';

export interface PlayMessage extends SocketMessage {
  type: 'play';
  game: string;
  player: PlayerId;
}

export interface DebugPlayMessage extends SocketMessage {
  type: 'debug_play';
  player: PlayerId;
}

export interface PlayError extends SocketMessage {
  type: 'play_error';
  error: string;
  errorCode?: ErrorCode;
}

export interface PlayUpdates extends SocketMessage {
  type: 'play_updates';
  events: PlayerEvent[];
}

export interface PlayAction extends SocketMessage {
  type: 'play_action';
  action: Action;
}

export interface DebugPlayAction extends SocketMessage {
  type: 'debug_play_action';
  action: Action;
}

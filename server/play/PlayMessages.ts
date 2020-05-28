import { PlayerId, PlayerEvent, Action } from '../../app/play/common';

export interface PlayMessage {
  type: 'play'
  game: string
  player: PlayerId
}

export interface DebugPlayMessage {
  type: 'debug_play';
  player: PlayerId;
}

export interface PlayError {
  type: 'play_error'
  error: string
}

export interface PlayUpdates {
  type: 'play_updates'
  events: PlayerEvent[]
}

export interface PlayAction {
  type: 'play_action'
  action: Action
}

export interface DebugPlayAction {
  type: 'debug_play_action'
  action: Action
}
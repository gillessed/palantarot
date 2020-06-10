import { TypedAction } from 'redoodle';
import { Action, PlayerEvent } from '../../play/common';
import { inGameSocketService } from './InGameSagas';
import { JoinGamePayload } from './InGameTypes';

const playAction = TypedAction.define("PLAY // ACTION")<Action>();
const playError = TypedAction.define("PLAY // ERROR")<string>();
const playUpdate = TypedAction.define("PLAY // UPDATE")<PlayerEvent[]>();
const closeShowWindow = TypedAction.define("PLAY // CLOSE SHOW INWDOW")<void>();
export const InGameActions = {
  playAction,
  playError,
  playUpdate,
  exitGame: inGameSocketService.actions.close,
  closeShowWindow,
};

const debugJoinGame = TypedAction.define("DEBUG PLAY // JOIN")<JoinGamePayload>();
const debugPlayAction = TypedAction.define("DEBUG PLAY // ACTION")<Action>();
const autoplay = TypedAction.define("DEBUG PLAY // AUTOPLAY")<void>();
export const DebugInGameActions = {
  debugJoinGame,
  debugPlayAction,
  autoplay,
};

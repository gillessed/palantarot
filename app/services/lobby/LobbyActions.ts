import { TypedAction } from 'redoodle';
import { GameDescription } from '../../../server/play/GameDescription';
import { GameSettings } from '../../play/server';
import { lobbyService } from './LobbyService';

const newGame = TypedAction.define("LOBBY // NEW GAME")<GameSettings>();
const gameUpdate = TypedAction.define("LOBBY // GAME UPDATE")<GameDescription>();

export const LobbyActions = {
  ...lobbyService.actions,
  newGame,
  gameUpdate,
};

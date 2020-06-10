import { TypedAction } from 'redoodle';
import { GameDescription } from '../../../server/play/GameDescription';
import { lobbyService } from './LobbyService';

const newGame = TypedAction.define("LOBBY // NEW GAME")<void>();
const gameUpdate = TypedAction.define("LOBBY // GAME UPDATE")<GameDescription>();

export const LobbyActions = {
  ...lobbyService.actions,
  newGame,
  gameUpdate,
};

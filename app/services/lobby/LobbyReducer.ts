import { GameDescription } from '../../../server/play/GameDescription';
import { LobbyActions } from './LobbyActions';
import { lobbyService } from './LobbyService';
import { LobbyService } from './LobbyTypes';

function gameUpdateReducer(state: LobbyService, game: GameDescription) {
  if (!state.value || state.loading) {
    return state;
  }
  const newMap = new Map(state.value);
  newMap.set(game.id, game);
  return {
    ...state,
    value: newMap,
  };
}

export const lobbyReducer = lobbyService.reducer
  .withHandler(LobbyActions.gameUpdate.TYPE, gameUpdateReducer)
  .build();
import { Store } from 'redux';
import { ClientGame } from '../services/room/ClientGame';
import { ReduxState } from '../services/rootReducer';

function getGameUpdatedFiltered(
  store: Store<ReduxState>
): () => ClientGame | null {
  return function () {
    const game = store.getState().room?.game;
    if (!game) {
      return null;
    }
    return {
      ...game,
      events: game.events,
    };
  };
}

interface ReduxDebug {
  getState(): ReduxState;
  getGameUpdatesFiltered(): ClientGame;
}

export function registerConsoleStore(store: Store<ReduxState>) {
  const redux = {
    getState: () => store.getState(),
    getGameUpdatesFiltered: getGameUpdatedFiltered(store),
  };
  (window as any).redux = redux;
}

export function getWindowRedux(): ReduxDebug {
  return (window as any).redux;
}

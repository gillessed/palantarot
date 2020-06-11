import { Store } from 'redux';
import { InGameState } from '../services/ingame/InGameTypes';
import { ReduxState } from "../services/rootReducer";

function getGameUpdatedFiltered(store: Store<ReduxState>): () => InGameState {
  return function() {
    const game = store.getState().ingame;
    const filteredEvents = game.events.filter((event) => {
      return event.type !== 'entered_chat' && event.type !== 'left_chat';
    });
    return {
      ...game,
      events: filteredEvents,
    }
  }
}

interface ReduxDebug {
  getState(): ReduxState;
  getGameUpdatesFiltered(): InGameState;
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
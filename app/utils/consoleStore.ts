import { Store } from 'redux';
import { ReduxState } from "../services/rootReducer";

function getGameUpdatedFiltered(store: Store<ReduxState>) {
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

export function registerConsoleStore(store: Store<ReduxState>) {
  (window as any).redux = {
    store,
    getGameUpdatesFiltered: getGameUpdatedFiltered(store),
  };
}
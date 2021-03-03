import { TypedReducer } from 'redoodle';
import { ErrorEvent, PlayerEvent } from '../../play/common';
import { BlankState, updateForEvent } from '../../play/ingame/playLogic';
import { InGameActions } from './InGameActions';
import { inGameSocketService } from './InGameSagas';
import { InGameState, JoinGamePayload } from './InGameTypes';

const joinGameReducer = (_: InGameState | null, payload: JoinGamePayload): InGameState => ({
  player: payload.player,
  game_id: payload.game,
  events: [],
  state: BlankState,
  autoplay: false,
});

const playErrorReducer = (state: InGameState | null, error: string): InGameState | null => {
  if (state == null) {
    return null;
  }
  const event: ErrorEvent = { type: 'error', error, privateTo: undefined };
  return {
    ...state,
    events: [...state.events, event],
  };
};

const playUpdateReducer = (state: InGameState | null, updates: PlayerEvent[]): InGameState | null => {
  if (state == null) {
    return null;
  }
  let play_state = state.state;
  for (const update of updates) {
    play_state = updateForEvent(play_state, update, state.player);
  }
  return {
    ...state,
    state: play_state,
    events: [
      ...state.events,
      ...updates
    ],
  };
}

const setAutoplayReducer = (state: InGameState | null, autoplay: boolean): InGameState | null => {
  if (state == null) {
    return null;
  }
  return { ...state, autoplay };
}

const closeShowWindowReducer = (state: InGameState | null): InGameState | null => {
  if (state === null) {
    return null;
  }
  return {
    ...state,
    state: {
      ...state.state,
      showIndex: null,
    },
  };
}

export const inGameReducer = TypedReducer.builder<InGameState | null>()
.withDefaultHandler((state = null) => state)
.withHandler(inGameSocketService.actions.join.TYPE, joinGameReducer)
.withHandler(InGameActions.playError.TYPE, playErrorReducer)
.withHandler(InGameActions.playUpdate.TYPE, playUpdateReducer)
.withHandler(InGameActions.closeShowWindow.TYPE, closeShowWindowReducer)
.withHandler(InGameActions.setAutoplay.TYPE, setAutoplayReducer)
.withHandler(InGameActions.exitGame.TYPE, () => null)
.build();

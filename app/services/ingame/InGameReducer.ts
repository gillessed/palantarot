import { TypedReducer } from 'redoodle';
import { ErrorEvent, PlayerEvent } from '../../play/common';
import { blank_state, updateForEvent } from '../../play/ingame/playLogic';
import { InGameActions } from './InGameActions';
import { InGameState, JoinGamePayload } from './InGameTypes';

const joinGameReducer = (_: InGameState | null, payload: JoinGamePayload) => ({
  player: payload.player,
  game_id: payload.game,
  events: [],
  state: blank_state,
});

const playErrorReducer = (state: InGameState | null, error: string): InGameState | null => {
  if (state == null) {
    return null;
  }
  const event: ErrorEvent = { type: 'error', error, private_to: undefined };
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
  return ({
    ...state,
    state: play_state,
    events: [
      ...state.events,
      ...updates
    ],
  })
}

export const inGameReducer = TypedReducer.builder<InGameState | null>()
.withDefaultHandler((state = null) => state)
.withHandler(InGameActions.joinGame.TYPE, joinGameReducer)
.withHandler(InGameActions.playError.TYPE, playErrorReducer)
.withHandler(InGameActions.playUpdate.TYPE, playUpdateReducer)
.withHandler(InGameActions.exitGame.TYPE, () => null)
.build();

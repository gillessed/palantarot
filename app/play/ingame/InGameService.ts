import {Action, Player, PlayerEvent} from "../common";
import {TypedAction, TypedReducer} from "redoodle";
import {ReduxState} from "../../services/rootReducer";
import {Store} from "redux";
import {call, cancelled, put, take} from "redux-saga/effects";
import {takeEveryPayload} from "../../services/redux/serviceSaga";
import {END, eventChannel, SagaIterator} from "redux-saga";
import WebSocket from "ws";

export interface InGameState {
  readonly player: Player
  readonly game_id: string
  readonly events: PlayerEvent[];
}

const empty_state: InGameState = {
  player: "<unknown player>",
  game_id: "<unknown game>",
  events: [],
};

const join_game = TypedAction.define("PLAY")<[Player, string]>();
const play_action = TypedAction.define("PLAY // ACTION")<Action>();
const play_error = TypedAction.define("PLAY // ERROR")<string>();
const play_update = TypedAction.define("PLAY // UPDATE")<PlayerEvent[]>();
const exit_game = TypedAction.define("PLAY // EXIT")<void>();

export const inGameReducer = TypedReducer.builder<InGameState>()
  .withDefaultHandler((state= empty_state) => state)
  .withHandler(join_game.TYPE, (state, args) => ({
    player: args[0],
    game_id: args[1],
    events: [],
  }))
  .withHandler(play_error.TYPE, (state, error) => ({
    ...state,
    events: [
      ...state.events,
      {
        type: 'error',
        error,
      }
    ]
  }))
  .withHandler(play_update.TYPE, (state, updates) => ({
    ...state,
    events: [
      ...state.events,
      ...updates
    ],
  }))
  .build();

export class InGameDispatcher {
  constructor(
    private readonly store: Store<ReduxState>,
  ) {}

  public joinGame(player: Player, game: string) {
    this.store.dispatch(join_game([player, game]));
  }

  public playAction(action: Action) {
    this.store.dispatch(play_action(action));
  }

  public actionError(error: Error) {
    this.store.dispatch(play_error(error.message));
  }

  public exitGame() {
    this.store.dispatch(exit_game());
  }
}

export function* inGameSaga () {
  yield takeEveryPayload(join_game, function* (action: [Player, string]): SagaIterator {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const websocketUri = `${protocol}//${window.location.host}/ws`;
    const websocket = new WebSocket(websocketUri);

    const channel = yield call(listen, websocket);
    websocket.emit('play', action[1], action[0]);
    yield takeEveryPayload(play_action, function* (action) {
      websocket.emit('play_action', action)
    });
    yield takeEveryPayload(exit_game, function* () {
      channel.close();
    });
    try {
      while (true) {
        const events: PlayerEvent[] = yield take(channel);
        yield put(play_update(events))
      }
    } finally {
      if (yield cancelled()) {
        channel.close();
      }
    }

  });
}

function listen(socket: WebSocket) {
  return eventChannel((emitter) => {

    socket.on('play_events', (events: PlayerEvent[]) => {
      emitter(events)
    });

    socket.on('error', (error) => {
      emitter({type: 'error', error: error.message})
    });

    socket.on('play_error', (error: string) => {
      emitter({type: 'error', error})
    });

    socket.on('close', () => emitter(END));
    return () => {
      socket.close();
    }
  });
}

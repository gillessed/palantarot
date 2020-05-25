import { TypedAction, TypedReducer } from "redoodle";
import { Store } from "redux";
import { END, eventChannel, SagaIterator } from "redux-saga";
import { call, cancelled, put, take } from "redux-saga/effects";
import { PlayAction, PlayError, PlayMessage, PlayUpdates } from "../../../server/play/PlayService";
import { takeEveryPayload } from "../../services/redux/serviceSaga";
import { ReduxState } from "../../services/rootReducer";
import { Action, PlayerEvent, PlayerId } from '../common';
import { blank_state, PlayState, updateForEvent } from "./playLogic";

export interface InGameState {
  readonly player: PlayerId
  readonly game_id: string
  readonly events: PlayerEvent[]
  readonly state: PlayState
}

const empty_state: InGameState = {
  player: "<unknown player>",
  game_id: "<unknown game>",
  events: [],
  state: blank_state,
};

const join_game = TypedAction.define("PLAY")<[PlayerId, string]>();
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
    state: blank_state,
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
  .withHandler(play_update.TYPE, (state, updates) => {
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
  })
  .build();

export class InGameDispatcher {
  constructor(
    private readonly store: Store<ReduxState>,
  ) {}

  public joinGame(player: PlayerId, game: string) {
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
  yield takeEveryPayload(join_game, function* (action: [PlayerId, string]): SagaIterator {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const websocketUri = `${protocol}//${window.location.host}/ws`;
    const websocket = new WebSocket(websocketUri);
    websocket.onopen = () => {
      websocket.send(JSON.stringify({
        type: 'play',
        game: action[1],
        player: action[0],
      } as PlayMessage));
    };

    const channel = yield call(listen, websocket);
    yield takeEveryPayload(play_action, function* (action) {
      websocket.send(JSON.stringify({
        type: 'play_action',
        action: action,
      } as PlayAction))
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

type Message = PlayUpdates | PlayError

function listen(socket: WebSocket) {
  return eventChannel((emitter) => {

    socket.onmessage = (event) => {
      const data: Message = JSON.parse(event.data);
      console.debug("Got data", data);
      if (data.type === 'play_updates') {
        emitter(data.events)
      } else if (data.type === 'play_error') {
        emitter([{type: 'error', error: data.error}])
      }
    };

    socket.onclose = () => emitter(END);
    return () => {
      socket.close();
    }
  });
}

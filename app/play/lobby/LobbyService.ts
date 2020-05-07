import {Loadable} from "../../services/redux/loadable";
import {generatePropertyService} from "../../services/redux/serviceGenerator";
import {ServerApi} from "../../api/serverApi";
import {ReduxState} from "../../services/rootReducer";
import {Loader} from "../../services/loader";
import {Dispatchers} from "../../services/dispatchers";
import {PropertyCachingState} from "../../services/redux/serviceDispatcher";
import {GameDescription} from "../common";
import {TypedAction} from "redoodle";
import {Store} from "redux";
import {takeEveryTyped} from "../../services/redux/serviceSaga";
import {SagaIterator} from "redux-saga";
import {call, put} from "redux-saga/effects";

export type Lobby = Map<string, GameDescription>;

export type LobbyService = Loadable<void, Lobby>;

const lobbyService = generatePropertyService<void, Lobby>('LOBBY',
    (api: ServerApi) => {
        return () => {
            return api.listPlayableGames()
                .then(games =>
                    new Map(Object.keys(games).map(game => [game, games[game]]))
                )
        }
    },
);

export const lobbyActions = {
  ...lobbyService.actions,
  newGame: TypedAction.define("LOBBY // NEW GAME")<void>(),
};
export class LobbyDispatcher extends lobbyService.dispatcher {
  constructor(
    private readonly store2: Store<ReduxState>,
    options?: {
      caching?: PropertyCachingState<void, Lobby>,
      debounce?: number,
    }
  ) {
    super(store2, options);
  }

  public newGame() {
    this.store2.dispatch(lobbyActions.newGame());
  }
}
export const lobbyReducer = lobbyService.reducer.build();
export const lobbySaga = function* (api: ServerApi) {
  yield takeEveryTyped(
    lobbyActions.newGame,
    function* (action): SagaIterator {
      yield call(api.playNewGame);
      yield put(lobbyActions.request())
    }
  );
  yield lobbyService.saga(api);
};
export const lobbyLoader: Loader<ReduxState, void, Lobby> = {
    get: (state: ReduxState) => state.lobby,
    load: (dispatchers: Dispatchers, request: void, force?: boolean) => dispatchers.lobby.request(),
};


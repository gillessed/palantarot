import {TypedAction, TypedReducer} from 'redoodle';
import {Store} from 'redux';
import {all, put, takeLatest} from 'redux-saga/effects';
import {actionName} from '../redux/actionName';
import {ReduxState} from '../rootReducer';
import {NewPlayer, Player} from './../../../server/model/Player';
import {curry} from './../../../server/utils';
import {ServerApi} from './../../api/serverApi';

export interface AddNewPlayerPayload {
  newPlayer: NewPlayer;
  redirect?: string;
  source?: any;
}

const name = actionName('addPlayer');

export const addNewPlayerActions = {
  request: TypedAction.define(name('request'))<AddNewPlayerPayload>(),
  error: TypedAction.define(name('error'))<Error>(),
  loading: TypedAction.define(name('loading'))<void>(),
  success: TypedAction.define(name('success'))<Player>(),
  clear: TypedAction.define(name('clear'))<void>(),
};

export class AddNewPlayerDispatcher {
  constructor(public readonly store: Store<ReduxState>) {}

  public request(payload: AddNewPlayerPayload) {
    this.store.dispatch(addNewPlayerActions.request(payload));
  }

  public clear() {
    this.store.dispatch(addNewPlayerActions.clear(undefined));
  }
}

export function* addNewPlayerSaga(api: ServerApi) {
  yield all([
    takeLatest(addNewPlayerActions.request.TYPE, curry(addPlayer)(api)),
  ]);
}

function* addPlayer(api: ServerApi, action: TypedAction<AddNewPlayerPayload>) {
  try {
    yield put(addNewPlayerActions.loading(undefined));
    const player: Player = yield api.addPlayer(action.payload.newPlayer);
    yield put(addNewPlayerActions.success(player));
  } catch (e) {
    yield put(addNewPlayerActions.error(e));
  }
}

export interface AddPlayerService {
  redirect?: string;
  newPlayer?: Player;
  error?: Error;
  loading: boolean;
  source?: any;
}

const INITIAL_STATE = {
  loading: false,
};

export const addPlayerReducer = TypedReducer.builder<AddPlayerService>()
  .withHandler(
    addNewPlayerActions.request.TYPE,
    (state: AddPlayerService, payload: AddNewPlayerPayload) => {
      return {
        ...state,
        redirect: payload.redirect,
        source: payload.source,
      };
    }
  )
  .withHandler(addNewPlayerActions.loading.TYPE, (state: AddPlayerService) => {
    return {
      ...state,
      newPlayer: undefined,
      error: undefined,
      loading: true,
    };
  })
  .withHandler(
    addNewPlayerActions.success.TYPE,
    (state: AddPlayerService, payload: Player) => {
      return {
        ...state,
        newPlayer: payload,
        error: undefined,
        loading: false,
      };
    }
  )
  .withHandler(
    addNewPlayerActions.error.TYPE,
    (state: AddPlayerService, payload: Error) => {
      return {
        ...state,
        newPlayer: undefined,
        error: payload,
        loading: false,
      };
    }
  )
  .withHandler(addNewPlayerActions.clear.TYPE, () => INITIAL_STATE)
  .withDefaultHandler((state = INITIAL_STATE) => state)
  .build();

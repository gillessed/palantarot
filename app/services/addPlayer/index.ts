import { TypedAction, TypedReducer } from 'redoodle';
import { Store } from 'redux';
import { all, put } from 'redux-saga/effects';
import { takeLatestTyped } from '../redux/serviceSaga';
import { ReduxState } from '../rootReducer';
import { NewPlayer, Player } from './../../../server/model/Player';
import { curry } from './../../../server/utils';
import { ServerApi } from './../../api/serverApi';
export interface AddNewPlayerPayload {
  newPlayer: NewPlayer,
  redirect?: string,
  source?: any,
}

export const addNewPlayerActions = {
  request: TypedAction.define('ADD_NEW_PLAYER // REQUEST')<AddNewPlayerPayload>(),
  error: TypedAction.define('ADD_NEW_PLAYER // ERROR')<Error>(),
  loading: TypedAction.define('ADD_NEW_PLAYER // LOADING')<void>(),
  success: TypedAction.define('ADD_NEW_PLAYER // SUCCESS')<Player>(),
  clear: TypedAction.define('ADD_NEW_PLAYER // CLEAR')<void>(),
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
    takeLatestTyped(addNewPlayerActions.request, curry(addPlayer)(api)),
  ]);
}

function* addPlayer(api: ServerApi, action: TypedAction<AddNewPlayerPayload>) {
  try { 
    yield put(addNewPlayerActions.loading(undefined));
    const player = yield api.addPlayer(action.payload.newPlayer);
    yield put(addNewPlayerActions.success(player));
  } catch(e) {
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
  .withHandler(addNewPlayerActions.request.TYPE, (state: AddPlayerService, payload: AddNewPlayerPayload) => {
    return {
      ...state,
      redirect: payload.redirect,
      source: payload.source,
    };
  })
  .withHandler(addNewPlayerActions.loading.TYPE, (state: AddPlayerService) => {
    return {
      ...state,
      newPlayer: undefined,
      error: undefined,
      loading: true,
    };
  })
  .withHandler(addNewPlayerActions.success.TYPE, (state: AddPlayerService, payload: Player) => {
    return {
      ...state,
      newPlayer: payload,
      error: undefined,
      loading: false,
    };
  })
  .withHandler(addNewPlayerActions.error.TYPE, (state: AddPlayerService, payload: Error) => {
    return {
      ...state,
      newPlayer: undefined,
      error: payload, 
      loading: false,
    };
  })
  .withHandler(addNewPlayerActions.clear.TYPE, () => INITIAL_STATE)
  .withDefaultHandler((state = INITIAL_STATE) => state)
  .build();

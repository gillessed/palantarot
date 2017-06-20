import { takeLatestTyped } from '../redux/serviceSaga';
import { TypedAction } from './../redux/typedAction';
import { Player, NewPlayer } from './../../../server/model/Player';
import { curry } from './../../../server/utils';
import {
  createActionType,
  createActionCreator,
} from './../redux/typedAction';
import { ServerApi } from './../../api/serverApi';
import { newTypedReducer } from '../redux/typedReducer';
import { put } from 'redux-saga/effects';

export interface AddNewPlayerPayload {
  newPlayer: NewPlayer,
  redirect?: string,
  source?: any,
}

export const addNewPlayerActions = {
  REQUEST: createActionType<AddNewPlayerPayload>('ADD_NEW_PLAYER // REQUEST'),
  ERROR: createActionType<Error>('ADD_NEW_PLAYER // ERROR'),
  LOADING: createActionType<void>('ADD_NEW_PLAYER // LOADING'),
  SUCCESS: createActionType<Player>('ADD_NEW_PLAYER // SUCCESS'),
  CLEAR: createActionType<void>('ADD_NEW_PLAYER // CLEAR'),
};

export const addNewPlayerActionCreators = {
  request: createActionCreator(addNewPlayerActions.REQUEST),
  error: createActionCreator(addNewPlayerActions.ERROR),
  loading: createActionCreator(addNewPlayerActions.LOADING),
  success: createActionCreator(addNewPlayerActions.SUCCESS),
  clear: createActionCreator(addNewPlayerActions.CLEAR),
};

export function* addNewPlayerSaga(api: ServerApi) {
  yield [
    takeLatestTyped(addNewPlayerActions.REQUEST, curry(addPlayer)(api)),
  ];
}

function* addPlayer(api: ServerApi, action: TypedAction<AddNewPlayerPayload>) {
  try { 
    yield put(addNewPlayerActionCreators.loading(undefined));
    const player = yield api.addPlayer(action.payload.newPlayer);
    yield put(addNewPlayerActionCreators.success(player));
  } catch(e) {
    yield put(addNewPlayerActionCreators.error(e));
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

export const addPlayerReducer = newTypedReducer<AddPlayerService>()
  .handlePayload(addNewPlayerActions.REQUEST, (state: AddPlayerService, payload: AddNewPlayerPayload) => {
    return {
      ...state,
      redirect: payload.redirect,
      source: payload.source,
    };
  })
  .handlePayload(addNewPlayerActions.LOADING, (state: AddPlayerService) => {
    return {
      ...state,
      newPlayer: undefined,
      error: undefined,
      loading: true,
    };
  })
  .handlePayload(addNewPlayerActions.SUCCESS, (state: AddPlayerService, payload: Player) => {
    return {
      ...state,
      newPlayer: payload,
      error: undefined,
      loading: false,
    };
  })
  .handlePayload(addNewPlayerActions.ERROR, (state: AddPlayerService, payload: Error) => {
    return {
      ...state,
      newPlayer: undefined,
      error: payload, 
      loading: false,
    };
  })
  .handlePayload(addNewPlayerActions.CLEAR, () => INITIAL_STATE)
  .handleDefault(() => INITIAL_STATE)
  .build();
import { LoadablePropertyActionCreators, LoadableServiceActionCreators } from './serviceActions';
import {
  ActionType,
  TypedAction,
} from './typedAction';
import { SagaIterator } from 'redux-saga';
import { put, call, takeEvery, takeLatest } from 'redux-saga/effects';

export interface AsyncOperationBasePayload<T> {
  arg: T;
}

export interface AsyncOperationSuccessPayload<T, R> extends AsyncOperationBasePayload<T> {
  result: R;
}

export interface AsyncOperationErrorPayload<T> extends AsyncOperationBasePayload<T> {
  error: Error;
}

export interface IObject<O> {
  object: O;
}


export function createSagaServiceOperation<ARG, RESULT>(
  operation: (arg: ARG[]) => Promise<Map<ARG, RESULT>> | Map<ARG, RESULT>,
  actionCreators: LoadableServiceActionCreators<ARG, RESULT>) {
  return function* (action: TypedAction<ARG[]>): SagaIterator {
    const arg = action.payload;
    try {
      yield put(actionCreators.loading(arg));
      const result = yield call(operation, arg);
      yield put(actionCreators.success({ arg, result }));
    } catch (error) {
      yield put(actionCreators.error({ arg, error }));
    }
  };
}

export function createSagaPropertyOperation<ARG, RESULT>(
  operation: (arg: ARG) => Promise<RESULT> | RESULT,
  actionCreators: LoadablePropertyActionCreators<ARG, RESULT>) {
  return function* (action: TypedAction<ARG>): SagaIterator {
    const arg = action.payload;
    try {
      yield put(actionCreators.loading(undefined));
      const result = yield call(operation, arg);
      yield put(actionCreators.success({ result }));
    } catch (error) {
      yield put(actionCreators.error({ error }));
    }
  };
}

export function takeLatestTyped<ARG>(
  actionType: ActionType<ARG>,
  saga: (action: TypedAction<ARG>) => IterableIterator<any>) {
  return takeLatest(actionType, saga);
}

export function takeEveryTyped<ARG>(
  actionType: ActionType<ARG>,
  saga: (action: TypedAction<ARG>) => IterableIterator<any>) {
  return takeEvery(actionType, saga);
}

export function takeEveryPayload<ARG>(
  actionType: ActionType<ARG>,
  saga: (payload: ARG) => IterableIterator<any>) {
  return takeEveryTyped(actionType, (action) => saga(action.payload));
}

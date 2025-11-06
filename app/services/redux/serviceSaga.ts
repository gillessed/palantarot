import { TypedAction } from "redoodle";
import { type SagaIterator } from "redux-saga";
import { call, put } from "redux-saga/effects";
import { type PropertyActions, type ServiceActions } from "./serviceActions";

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
  actions: ServiceActions<ARG, RESULT>
) {
  return function* (action: TypedAction<ARG[]>): SagaIterator {
    const arg = action.payload;
    try {
      yield put(actions.loading(arg));
      const result = yield call(operation, arg);
      yield put(actions.success({ arg, result }));
    } catch (error: any) {
      yield put(actions.error({ arg, error }));
    }
  };
}

export function createSagaPropertyOperation<ARG, RESULT>(
  operation: (arg: ARG) => Promise<RESULT> | RESULT,
  actions: PropertyActions<ARG, RESULT>
) {
  return function* (action: TypedAction<ARG>): SagaIterator {
    const arg = action.payload;
    try {
      yield put(actions.loading(undefined));
      const result = yield call(operation, arg);
      yield put(actions.success({ arg, result }));
    } catch (error) {
      yield put(actions.error({ error }));
    }
  };
}

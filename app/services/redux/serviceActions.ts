import {
  ActionType,
  createActionType,
  TypedActionCreator,
  createActionCreator,
} from './typedAction';

// Service

export interface LoadableServiceActions<REQUEST, RESULT> {
  REQUEST: ActionType<REQUEST[]>;
  LOADING: ActionType<REQUEST[]>;
  SUCCESS: ActionType<{ arg: REQUEST[], result: Map<REQUEST, RESULT> }>;
  ERROR: ActionType<{ arg: REQUEST[], error: Error }>;
  CLEAR: ActionType<REQUEST[]>;
  CLEAR_ALL: ActionType<void>;
}

export function generateServiceActions<REQUEST, RESULT>(prefix: string): LoadableServiceActions<REQUEST, RESULT> {
  return {
    REQUEST: createActionType<REQUEST[]>(prefix + ' // REQUEST'),
    LOADING: createActionType<REQUEST[]>(prefix + ' // LOADING'),
    SUCCESS: createActionType<{ arg: REQUEST[], result: Map<REQUEST, RESULT> }>(prefix + ' // SUCCESS'),
    ERROR: createActionType<{ arg: REQUEST[], error: Error }>(prefix + ' // ERROR'),
    CLEAR: createActionType<REQUEST[]>(prefix + ' // CLEAR'),
    CLEAR_ALL: createActionType<void>(prefix + ' // CLEAR ALL'),
  };
}

export interface LoadableServiceActionCreators<REQUEST, RESULT> {
  request: TypedActionCreator<REQUEST[]>;
  loading: TypedActionCreator<REQUEST[]>;
  success: TypedActionCreator<{ arg: REQUEST[], result: Map<REQUEST, RESULT> }>;
  error: TypedActionCreator<{ arg: REQUEST[], error: Error }>;
  clear: TypedActionCreator<REQUEST[]>;
  clearAll: TypedActionCreator<void>;
}

export function generateServiceActionCreators<REQUEST, RESULT>(
  actions: LoadableServiceActions<REQUEST, RESULT>,
): LoadableServiceActionCreators<REQUEST, RESULT> {
  return {
    request: createActionCreator(actions.REQUEST),
    loading: createActionCreator(actions.LOADING),
    success: createActionCreator(actions.SUCCESS),
    error: createActionCreator(actions.ERROR),
    clear: createActionCreator(actions.CLEAR),
    clearAll: createActionCreator(actions.CLEAR_ALL),
  };
}

// Properties

export interface LoadablePropertyActions<ARG, RESULT> {
  REQUEST: ActionType<ARG>;
  LOADING: ActionType<void>;
  SUCCESS: ActionType<{result: RESULT}>;
  ERROR: ActionType<{error: Error}>;
  CLEAR: ActionType<void>;
}

export function generatePropertyActions<ARG, RESULT>(prefix: string): LoadablePropertyActions<ARG, RESULT> {
  return {
    REQUEST: createActionType<{arg: ARG}>(prefix + ' // REQUEST'),
    LOADING: createActionType<void>(prefix + ' // LOADING'),
    SUCCESS: createActionType<{result: RESULT}>(prefix + ' // SUCCESS'),
    ERROR: createActionType<{error: Error}>(prefix + ' // ERROR'),
    CLEAR: createActionType<void>(prefix + ' // CLEAR'),
  };
}

export interface LoadablePropertyActionCreators<ARG, RESULT> {
  request: TypedActionCreator<ARG>;
  loading: TypedActionCreator<void>;
  success: TypedActionCreator<{result: RESULT}>;
  error: TypedActionCreator<{error: Error}>;
  clear: TypedActionCreator<void>;
}

export function generatePropertyActionCreators<ARG, RESULT>(
  actions: LoadablePropertyActions<ARG, RESULT>,
): LoadablePropertyActionCreators<ARG, RESULT> {
  return {
    request: createActionCreator(actions.REQUEST),
    loading: createActionCreator(actions.LOADING),
    success: createActionCreator(actions.SUCCESS),
    error: createActionCreator(actions.ERROR),
    clear: createActionCreator(actions.CLEAR),
  };
}
export interface Action {
  type: string;
  payload: any;
  meta?: any;
}

export interface TypedAction<T> extends Action {
  payload: T;
}

export type ActionType<T> = string & {
    __action_type_brand?: T;
};

export function createActionType<T>(type: string): ActionType<T> {
  return type;
}

export function createAction<T, P extends T>(type: ActionType<T>, payload: P, meta?: any): TypedAction<T> {
  if (meta) {
    return {type, payload, meta};
  } else {
    return {type, payload};
  }
}

export function isActionType<T>(action: Action, type: ActionType<T>): action is TypedAction<T> {
  return action.type === type;
}

export interface TypedActionCreator<T> {
  (payload: T, meta?: any): TypedAction<T>;
}

export function createActionCreator<T>(type: ActionType<T>): (payload: T, meta?: any) => {
  type: string;
  payload: T;
  meta?: any;
} {
  return function (payload, meta) { return createAction(type, payload, meta); };
}
import {Action, ActionType, TypedAction} from './typedAction';

export interface Reducer<S> {
  (state: S, action: Action): S;
}

export interface TypedReducerBuilder<S> {
  handle<T>(type: ActionType<T>, handler: (state: S, action: TypedAction<T>) => S): this;
  handlePayload<T>(type: ActionType<T>, handler: (state: S, payload: T) => S): this;
  handleDefault(handler: (state: S, action: Action) => S): this;
  build(): Reducer<S>;
}

class TypedReducerBuilderImpl<S> implements TypedReducerBuilder<S> {
  private typedHandlers: { [type: string]: Reducer<S> } = {};
  private defaultHandler: Reducer<S>;

  handle<T>(type: ActionType<T>, handler: (state: S, action: TypedAction<T>) => S): this {
    this.typedHandlers[type as string] = handler;
    return this;
  }

  handlePayload<T>(type: ActionType<T>, handler: (state: S, payload: T) => S): this {
    this.handle(type, (state, action) => handler(state, action.payload));
    return this;
  }

  handleDefault(handler: (state: S, action: Action) => S): this {
    this.defaultHandler = handler;
    return this;
  }

  build(): Reducer<S> {
    let defaultHandler: Reducer<S> = this.defaultHandler || ((state: S) => state);
    return new TypedReducerImpl<S>(this.typedHandlers, defaultHandler).reduce;
  }
}

class TypedReducerImpl<S> {
  private typedHandlers: { [type: string]: Reducer<S> };
  private defaultHandler: Reducer<S>;

  constructor(typedHandlers: { [type: string]: Reducer<S> }, defaultHandler: Reducer<S>) {
    this.typedHandlers = {...typedHandlers};
    this.defaultHandler = defaultHandler;
  }

  reduce = (state: S, action: Action): S => {
    let typedHandler = this.typedHandlers[action.type];
    if (typedHandler) {
      return typedHandler(state, action);
    } else {
      return this.defaultHandler(state, action);
    }
  };
}

export function newTypedReducer<S>(): TypedReducerBuilder<S> {
  return new TypedReducerBuilderImpl<S>();
}
import { LoadableServiceActionCreators, LoadablePropertyActionCreators } from './serviceActions';
import { Store } from 'redux';
import { ReduxState } from '../rootReducer';

export function generateServiceDispatcher<ARG, RESULT>(actionCreators: LoadableServiceActionCreators<ARG, RESULT>) {
  return class implements ServiceDispatcher<ARG> {
  constructor(public readonly store: Store<ReduxState>) {}

    public request(args: ARG[]) {
      this.store.dispatch(actionCreators.request(args));
    }

    public requestSingle(arg: ARG) {
      this.request([arg]);
    }

    public clear(args: ARG[]) {
      this.store.dispatch(actionCreators.clear(args));
    }

    public clearAll() {
      this.store.dispatch(actionCreators.clearAll(undefined));
    }
  }
}

export interface ServiceDispatcher<ARG> {
    request(args: ARG[]): void;
    requestSingle(arg: ARG): void;
    clear(args: ARG[]): void;
    clearAll(): void;
}

export function generatePropertyDispatcher<ARG, RESULT>(actionCreators: LoadablePropertyActionCreators<ARG, RESULT>) {
  return class implements PropertyDispatcher<ARG> {
  constructor(public readonly store: Store<ReduxState>) {}

    public request(arg: ARG) {
      this.store.dispatch(actionCreators.request(arg));
    }

    public clear() {
      this.store.dispatch(actionCreators.clear(undefined));
    }
  }
}

export interface PropertyDispatcher<ARG> {
    request(args: ARG): void;
    clear(): void;
}
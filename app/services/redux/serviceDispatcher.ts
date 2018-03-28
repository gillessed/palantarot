import { ServiceActions, PropertyActions } from './serviceActions';
import { Store } from 'redux';
import { ReduxState } from '../rootReducer';
import { Loadable, LoadableCache } from './loadable';
import { Month, IMonth } from '../../../server/model/Month';

export type CacheFunction<ARG, RESULT> = (arg: ARG, loadable?: Loadable<ARG, RESULT>) => boolean;

export function generateServiceDispatcher<ARG, RESULT>(actionCreators: ServiceActions<ARG, RESULT>) {
  return class implements ServiceDispatcher<ARG> {
  constructor(
    private readonly store: Store<ReduxState>,
    private readonly accessor?: (state: ReduxState) => LoadableCache<ARG, RESULT>,
    private readonly cacheFunction?: CacheFunction<ARG, RESULT>,
  ) {}

    public request(args: ARG[]) {
      let uncachedArgs = Array.from(args);
      if (this.accessor && this.cacheFunction) {
        const _cacheFunction = this.cacheFunction;
        const state = this.accessor(this.store.getState());
        uncachedArgs = uncachedArgs.filter((arg: ARG) => {
          return !_cacheFunction(arg, state.get(arg));
        });
      }
      if (uncachedArgs.length >= 1) {
        this.store.dispatch(actionCreators.request(uncachedArgs));
      }
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

export function generatePropertyDispatcher<ARG, RESULT>(actionCreators: PropertyActions<ARG, RESULT>) {
  return class implements PropertyDispatcher<ARG> {
  constructor(
    private readonly store: Store<ReduxState>,
    private readonly accessor?: (state: ReduxState) => Loadable<ARG, RESULT>,
    private readonly cacheFunction?: CacheFunction<ARG, RESULT>,
  ) {}

    public request(arg: ARG) {
      if (this.accessor && this.cacheFunction && this.cacheFunction(arg, this.accessor(this.store.getState()))) {
        return;
      }
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

export class CacheFunctions {
  static loading<ARG, RESULT>(): CacheFunction<ARG, RESULT> {
    return (_: ARG, loadable?: Loadable<ARG, RESULT>) => loadable ? loadable.loading : false;
  }
  /**
   * Cache all results that are not recent (from this month)
   */
  static notThisMonth<RESULT>(): CacheFunction<Month, RESULT> {
    return (arg: Month, loadable?: Loadable<Month, RESULT>) => {
      if (arg === IMonth.now()) {
        return false;
      }
      if (loadable && loadable.value) {
        return true;
      }
      return false;
    };
  }
}
import { debounce, isEqual } from 'lodash';
import { Store } from 'redux';
import { IMonth, Month } from '../../../server/model/Month';
import { DefaultArgToKey } from '../loader';
import { ReduxState } from '../rootReducer';
import { Loadable, LoadableCache } from './loadable';
import { PropertyActions, ServiceActions } from './serviceActions';

export function generateServiceDispatcher<ARG, RESULT, KEY = ARG>(actionCreators: ServiceActions<ARG, RESULT>) {
  return class implements ServiceDispatcher<ARG> {
    private debounceTime: number = 0;
    private caching?: ServiceCachingState<KEY, RESULT>;
    private argToKey: (arg: ARG) => KEY;
    constructor(
      private readonly store: Store<ReduxState>,
      options?: {
        caching?: ServiceCachingState<KEY, RESULT>,
        debounceTime?: number,
        argToKey?: (arg: ARG) => KEY,
      }
    ) {
      this.debounceTime = 0;
      if (options) {
        this.debounceTime = options.debounceTime;
        this.caching = options.caching;
        this.argToKey = options.argToKey ?? DefaultArgToKey;
      }
    }

    public request(args: ARG[], force?: boolean) {
      let uncachedArgs = Array.from(args);
      if (this.caching) {
        const { isCached } = this.caching;
        const state = this.caching.accessor(this.store.getState());
        uncachedArgs = uncachedArgs.filter((arg: ARG) => {
          const key = this.argToKey(arg);
          return !isCached(key, state.get(key)) || force;
        });
      }
      if (uncachedArgs.length >= 1) {
        this.debounceTime ? this.requestDebounced(uncachedArgs) : this.requestInternal(uncachedArgs);
      }
    }

    private requestDebounced = debounce(this.requestInternal, this.debounceTime);

    private requestInternal(arg: ARG[]) {
      this.store.dispatch(actionCreators.request(arg));
    }

    public requestSingle(arg: ARG, force?: boolean) {
      this.request([arg], force);
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
    requestSingle(arg: ARG, force?: boolean): void;
    clear(args: ARG[]): void;
    clearAll(): void;
}

export function generatePropertyDispatcher<ARG, RESULT>(actionCreators: PropertyActions<ARG, RESULT>) {
  return class implements PropertyDispatcher<ARG> {
    protected debounceTime: number = 0;
    protected caching?: PropertyCachingState<ARG, RESULT>;
    constructor(
      protected readonly store: Store<ReduxState>,
      options?: {
        caching?: PropertyCachingState<ARG, RESULT>,
        debounceTime?: number,
      }
    ) {
      this.debounceTime = 0;
      if (options) {
        this.debounceTime = options.debounceTime;
        this.caching = options.caching;
      }
    }

    public request(arg: ARG, force?: boolean) {
      if (this.caching) {
        const state = this.caching.accessor(this.store.getState());
        if (this.caching.isCached(arg, state) && !force) {
          return;
        }
      }
      this.debounceTime ? this.requestDebounced(arg) : this.requestInternal(arg);
    }

    private requestDebounced = debounce(this.requestInternal, this.debounceTime);

    private requestInternal(arg: ARG) {
      this.store.dispatch(actionCreators.request(arg));
    }

    public clear() {
      this.store.dispatch(actionCreators.clear(undefined));
    }
  }
}

export interface PropertyDispatcher<ARG> {
    request(args: ARG, force?: boolean): void;
    clear(): void;
}

export type CacheFunction<KEY, RESULT> = (arg: KEY, loadable?: Loadable<KEY, RESULT>) => boolean;

export interface ServiceCachingState<KEY, RESULT> {
  accessor: (state: ReduxState) => LoadableCache<KEY, RESULT>,
  isCached: CacheFunction<KEY, RESULT>,
}

export interface PropertyCachingState<KEY, RESULT> {
  accessor: (state: ReduxState) => Loadable<KEY, RESULT>,
  isCached: CacheFunction<KEY, RESULT>,
}

export namespace CacheFunction {
  export function loading<KEY, RESULT>(): CacheFunction<KEY, RESULT> {
    return (_: KEY, loadable?: Loadable<KEY, RESULT>) => loadable ? loadable.loading : false;
  }

  export function pageCache<KEY, RESULT>(): CacheFunction<KEY, RESULT> {
    return (key: KEY, loadable?: Loadable<KEY, RESULT>) => {
      if (!loadable || !loadable.cached) {
        return false;
      }
      return isEqual(key, loadable.key) && loadable.value !== undefined;
    };
  }

  export function notThisMonth<RESULT>(): CacheFunction<Month, RESULT> {
    return (key: Month, loadable?: Loadable<Month, RESULT>) => {
      if (key === IMonth.now()) {
        return false;
      }
      if (loadable && loadable.value) {
        return true;
      }
      return false;
    };
  }

  export function and<KEY, RESULT>(...fs: Array<CacheFunction<KEY, RESULT>>) {
    return (arg: KEY, loadable?: Loadable<KEY, RESULT>) => {
      return fs.map((f) => f(arg, loadable)).reduce(
        (acc, cur) => acc || cur,
        false,
      );
    }
  }
}

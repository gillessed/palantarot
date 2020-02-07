import { ServiceActions, PropertyActions } from './serviceActions';
import { Store } from 'redux';
import { ReduxState } from '../rootReducer';
import { Loadable, LoadableCache } from './loadable';
import { Month, IMonth } from '../../../server/model/Month';
import * as _ from 'lodash';
import { debounce } from 'plottable/build/src/utils/windowUtils';
import { DefaultArgToKey } from '../loader';

export function generateServiceDispatcher<ARG, RESULT, KEY = ARG>(actionCreators: ServiceActions<ARG, RESULT>) {
  return class implements ServiceDispatcher<ARG> {
    private debounce: number;
    private caching?: ServiceCachingState<KEY, RESULT>;
    private argToKey: (arg: ARG) => KEY;
    constructor(
      private readonly store: Store<ReduxState>,
      options?: {
        caching?: ServiceCachingState<KEY, RESULT>,
        debounce?: number,
        argToKey?: (arg: ARG) => KEY,
      }
    ) {
      this.debounce = 0;
      if (options) {
        this.debounce = options.debounce || 0;
        this.caching = options.caching;
        this.argToKey = options.argToKey ?? DefaultArgToKey;
      }
    }

    public request(args: ARG[], force?: boolean) {
      console.log('***** request',args);
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
        debounce ? this.requestDebounced(uncachedArgs) : this.requestInternal(uncachedArgs);
      }
    }

    private requestDebounced = _.debounce(this.requestInternal, this.debounce || 0);

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
    private debounce: number;
    private caching?: PropertyCachingState<ARG, RESULT>;
    constructor(
      private readonly store: Store<ReduxState>,
      options?: {
        caching?: PropertyCachingState<ARG, RESULT>,
        debounce?: number,
      }
    ) {
      this.debounce = 0;
      if (options) {
        this.debounce = options.debounce || 0;
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
      debounce ? this.requestDebounced(arg) : this.requestInternal(arg);
    }

    private requestDebounced = _.debounce(this.requestInternal, this.debounce || 0);

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
      return _.isEqual(key, loadable.key) && loadable.value !== undefined;
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

import { ServiceActions, PropertyActions } from './serviceActions';
import { Store } from 'redux';
import { ReduxState } from '../rootReducer';
import { Loadable, LoadableCache } from './loadable';
import { Month, IMonth } from '../../../server/model/Month';
import * as _ from 'lodash';
import { debounce } from 'plottable/build/src/utils/windowUtils';

export function generateServiceDispatcher<ARG, RESULT>(actionCreators: ServiceActions<ARG, RESULT>) {
  return class implements ServiceDispatcher<ARG> {
    private debounce: number;
    private caching?: ServiceCachingState<ARG, RESULT>;
    constructor(
      private readonly store: Store<ReduxState>,
      options?: {
        caching?: ServiceCachingState<ARG, RESULT>,
        debounce?: number,
      }
    ) {
      this.debounce = 0;
      if (options) {
        this.debounce = options.debounce || 0;
        this.caching = options.caching;
      }
    }

    public request(args: ARG[], force?: boolean) {
      let uncachedArgs = Array.from(args);
      if (this.caching) {
        const { isCached } = this.caching;
        const state = this.caching.accessor(this.store.getState());
        uncachedArgs = uncachedArgs.filter((arg: ARG) => {
          return !isCached(arg, state.get(arg)) || force;
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

export type CacheFunction<ARG, RESULT> = (arg: ARG, loadable?: Loadable<ARG, RESULT>) => boolean;

export interface ServiceCachingState<ARG, RESULT> {
  accessor: (state: ReduxState) => LoadableCache<ARG, RESULT>,
  isCached: CacheFunction<ARG, RESULT>,
}

export interface PropertyCachingState<ARG, RESULT> {
  accessor: (state: ReduxState) => Loadable<ARG, RESULT>,
  isCached: CacheFunction<ARG, RESULT>,
}

export namespace CacheFunction {
  export function loading<ARG, RESULT>(): CacheFunction<ARG, RESULT> {
    return (_: ARG, loadable?: Loadable<ARG, RESULT>) => loadable ? loadable.loading : false;
  }

  export function pageCache<ARG, RESULT>(): CacheFunction<ARG, RESULT> {
    return (arg: ARG, loadable?: Loadable<ARG, RESULT>) => {
      if (!loadable || !loadable.cached) {
        return false;
      }
      return _.isEqual(arg, loadable.key) && loadable.value !== undefined;
    };
  }

  export function notThisMonth<RESULT>(): CacheFunction<Month, RESULT> {
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

  export function and<ARG, RESULT>(...fs: Array<CacheFunction<ARG, RESULT>>) {
    return (arg: ARG, loadable?: Loadable<ARG, RESULT>) => {
      return fs.map((f) => f(arg, loadable)).reduce(
        (acc, cur) => acc || cur,
        false,
      );
    }
  }
}

export interface Loadable<KEY, VALUE> {
  key?: KEY;
  value?: VALUE;
  error?: Error;
  loading: boolean;
  timestamp?: number;
  cached?: boolean;
}

export class LoadableCache<KEY, VALUE> {
  private cache: Map<KEY, Loadable<KEY, VALUE>>;
  public loading: boolean;
  private cacheNext: boolean = false;

  private constructor(options?: {cache: Map<KEY, Loadable<KEY, VALUE>>, loading: boolean}) {
    if (options) {
      this.cache = options.cache;
      this.loading = options.loading;
    } else {
      this.cache = new Map<KEY, Loadable<KEY, VALUE>>();
      this.loading = false;
    }
  }

  public static create<KEY, VALUE>() {
    return new LoadableCache<KEY, VALUE>();
  }

  public get(key: KEY): Loadable<KEY, VALUE> {
    const entry = this.cache.get(key);
    if (entry) {
      return entry;
    } else {
      return {
        key,
        loading: false,
      };
    }
  }

  public has(key: KEY): boolean {
    return this.cache.has(key);
  }

  public getSubset(...keys: KEY[]): Map<KEY, Loadable<KEY, VALUE>> {
    return new Map<KEY, Loadable<KEY, VALUE>>(
      keys.map((key) => [key, this.get(key)] as [KEY, Loadable<KEY, VALUE>]),
    );
  }

  public getLoaded(key: KEY): VALUE | undefined {
    const entry = this.cache.get(key);
    if (entry) {
      return entry.value;
    } else {
      return undefined;
    }
  }

  public getLoadedSubset(...keys: KEY[]): Map<KEY, VALUE> {
    return new Map<KEY, VALUE>(keys
      .map((key) => {
        return [key, this.getLoaded(key)] as [KEY, VALUE];
      })
      .filter((key) => key[1]),
    );
  }

  public loadedSingle(key: KEY, object: VALUE) {
    return this.loaded(new Map<KEY, VALUE>([[key, object]]));
  }

  public loaded(objects: Map<KEY, VALUE>) {
    const newCache = new Map<KEY, Loadable<KEY, VALUE>>(this.cache);
    const date = new Date();
    for (const [key, object] of objects) {
      const entry = {
        key,
        loading: false,
        value: object,
        lastLoaded: date,
        cached: this.cacheNext,
      };
      newCache.set(key, entry);
    }
    return new LoadableCache<KEY, VALUE>({cache: newCache, loading: false});
  }

  public erroredSingle(key: KEY, error: Error) {
    return this.errored([key], error);
  }

  public errored(keys: KEY[], error: Error) {
    const newCache = new Map<KEY, Loadable<KEY, VALUE>>(this.cache);
    const date = new Date();
    keys.map((key) => {
      const entry = {
        key,
        loading: false,
        error,
        lastLoaded: date,
      };
      newCache.set(key, entry);
    });
    return new LoadableCache<KEY, VALUE>({cache: newCache, loading: this.loading});
  }

  public cacheValues(on: boolean) {
    this.cacheNext = on;
    const newCache = new Map<KEY, Loadable<KEY, VALUE>>();
    for (const key of newCache.keys()) {
      newCache.set(key, {
        ...this.cache.get(key)!,
        cached: on,
      });
    }
    return new LoadableCache<KEY, VALUE>({cache: newCache, loading: this.loading});
  }

  public keysLoading(...keys: KEY[]) {
    const newCache = new Map<KEY, Loadable<KEY, VALUE>>(this.cache);
    for (const key of keys) {
      const entry = { ...this.get(key), loading: true };
      newCache.set(key, entry);
    }
    return new LoadableCache<KEY, VALUE>({cache: newCache, loading: this.loading});
  }

  public globalLoading() {
    return new LoadableCache({cache: this.cache, loading: true});
  }

  public clear(...keys: KEY[]) {
    const newCache = new Map<KEY, Loadable<KEY, VALUE>>(this.cache);
    for (const key of keys) {
      newCache.delete(key);
    }
    return new LoadableCache<KEY, VALUE>({cache: newCache, loading: this.loading});
  }

  public clearAll() {
    return new LoadableCache<KEY, VALUE>();
  }
}
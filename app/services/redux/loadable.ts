export interface Loadable<T> {
  key?: string;
  value?: T;
  error?: Error;
  loading: boolean;
  timestamp?: number;
}

export class LoadableCache<T> {
  private cache: Map<string, Loadable<T>>;
  public loading: boolean;

  private constructor(options?: {cache: Map<string, Loadable<T>>, loading: boolean}) {
    if (options) {
      this.cache = options.cache;
      this.loading = options.loading;
    } else {
      this.cache = new Map<string, Loadable<T>>();
      this.loading = false;
    }
  }

  public static create<T>() {
    return new LoadableCache<T>();
  }

  public get(key: string): Loadable<T> {
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

  public has(key: string): boolean {
    return this.cache.has(key);
  }

  public getSubset(...keys: string[]): Map<string, Loadable<T>> {
    return new Map<string, Loadable<T>>(
      keys.map((key) => [key, this.get(key)] as [string, Loadable<T>]),
    );
  }

  public getLoaded(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (entry) {
      return entry.value;
    } else {
      return undefined;
    }
  }

  public getLoadedSubset(...keys:string[]): Map<string, T> {
    return new Map<string, T>(keys
      .map((key) => {
        return [key, this.getLoaded(key)] as [string, T];
      })
      .filter((key) => key[1]),
    );
  }

  public loadedSingle(key: string, object: T) {
    return this.loaded(new Map<string, T>([[key, object]]));
  }

  public loaded(objects: Map<string, T>) {
    const newCache = new Map<string, Loadable<T>>(this.cache);
    const date = new Date();
    for (const [key, object] of objects) {
      const entry = {
        key,
        loading: false,
        value: object,
        lastLoaded: date,
      };
      newCache.set(key, entry);
    }
    return new LoadableCache<T>({cache: newCache, loading: false});
  }

  public erroredSingle(key: string, error: Error) {
    return this.errored([key], error);
  }

  public errored(keys: string[], error: Error) {
    const newCache = new Map<string, Loadable<T>>(this.cache);
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
    return new LoadableCache<T>({cache: newCache, loading: this.loading});
  }

  public keysLoading(...keys: string[]) {
    const newCache = new Map<string, Loadable<T>>(this.cache);
    for (const key of keys) {
      const entry = { ...this.get(key), loading: true };
      newCache.set(key, entry);
    }
    return new LoadableCache<T>({cache: newCache, loading: this.loading});
  }

  public globalLoading() {
    return new LoadableCache({cache: this.cache, loading: true});
  }

  public clear(...keys: string[]) {
    const newCache = new Map<string, Loadable<T>>(this.cache);
    for (const key of keys) {
      newCache.delete(key);
    }
    return new LoadableCache<T>({cache: newCache, loading: this.loading});
  }

  public clearAll() {
    return new LoadableCache<T>();
  }
}
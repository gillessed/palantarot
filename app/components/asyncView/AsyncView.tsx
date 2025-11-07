import { memo, useEffect, useState } from "react";
import { AsyncLoader } from "../../services/useAsync";
import {
  Async,
  asyncError,
  asyncLoaded,
  asyncLoading,
  asyncUnloaded,
  isAsyncError,
  isAsyncLoaded,
  isAsyncLoading,
} from "../../utils/Async";
import { SpinnerOverlay } from "../spinnerOverlay/SpinnerOverlay";

type LoaderMap = Record<string, AsyncLoader<any, any>>;

type LoaderProps<Loaders extends LoaderMap> = {
  [K in keyof Loaders]: Loaders[K];
};

type ArgMap<Loaders extends LoaderMap> = {
  [K in keyof Loaders]: Loaders[K] extends AsyncLoader<any, infer Arg>
    ? Arg
    : never;
};

type LoadedState<Loaders extends LoaderMap> = {
  [K in keyof Loaders]: Loaders[K] extends AsyncLoader<infer Result, any>
    ? Result
    : never;
};

interface Props<Loaders extends LoaderMap> {
  loaders: LoaderProps<Loaders>;
  args: ArgMap<Loaders>;
  Component: React.FC<LoadedState<Loaders>>;
  // children: (state: LoadedState<Loaders>) => React.ReactNode,
}

export const AsyncView = function AsyncView<Loaders extends LoaderMap>(
  props: Props<Loaders>
) {
  const { Component , args, loaders } = props;

  const [state, setState] = useState<Async<LoadedState<Loaders>>>(
    asyncUnloaded()
  );

  useEffect(() => {
    async function load() {
      setState(asyncLoading);
      const promises: Promise<{ key: string; result: any }>[] = [];
      try {
        for (const entry of Object.entries(loaders)) {
          const key = entry[0];
          const loader = entry[1] as Loaders[typeof key];
          const doLoad = async () => {
            const result = await loader(args[key]);
            return { key, result };
          };
          promises.push(doLoad());
        }
        const results = await Promise.all(promises);
        const loadedStateUntyped: Record<string, any> = {};
        for (const { key, result } of results) {
          loadedStateUntyped[key] = result;
        }
        const loadedStateTyped = loadedStateUntyped as LoadedState<Loaders>;
        setState(asyncLoaded(loadedStateTyped));
      } catch (error: any) {
        setState(asyncError(error));
      }
    }
    load();
  }, [args, loaders, setState]);

  if (isAsyncLoading(state)) {
    return <SpinnerOverlay />;
  } else if (isAsyncError(state)) {
    return <div>{state.error}</div>;
  } else if (isAsyncLoaded(state)) {
    return <Component {...state.value} />;
  }
  return null;
};

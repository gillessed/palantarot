import { Alert } from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons-react";
import { useCallback, useEffect, useState } from "react";
import { useLoaderContext } from "../../services/utils/useLoaderContext";
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
import type { AsyncLoader } from "../../services/loaders/AsyncLoader";

type LoaderMap = Record<string, AsyncLoader<any, any>>;

type LoaderProps<Loaders extends LoaderMap> = {
  [K in keyof Loaders]: Loaders[K];
};

type ArgMap<Loaders extends LoaderMap> = {
  [K in keyof Loaders as Loaders[K] extends AsyncLoader<any, void>
    ? never
    : K]: Loaders[K] extends AsyncLoader<any, infer Arg> ? Arg : never;
};

type LoadedState<Loaders extends LoaderMap> = {
  [K in keyof Loaders]: Loaders[K] extends AsyncLoader<infer Result, any>
    ? Result
    : never;
};

type BaseProps<Loaders extends LoaderMap, AdditionalArgs> = {
  loaders: LoaderProps<Loaders>;
  Component: React.FC<LoadedState<Loaders> & AdditionalArgs & Reload>;
  loadingElement?: React.ReactNode;
};

type BasePropsWithArgs<
  Loaders extends LoaderMap,
  AdditionalArgs
> = (keyof ArgMap<Loaders> extends never
  ? { args?: ArgMap<Loaders> }
  : { args: ArgMap<Loaders> }) &
  BaseProps<Loaders, AdditionalArgs>;

type PropsWithAdditionalArgs<
  Loaders extends LoaderMap,
  AdditionalArgs
> = BasePropsWithArgs<Loaders, AdditionalArgs> & {
  additionalArgs: AdditionalArgs;
};

type Props<
  Loaders extends LoaderMap,
  AdditionalArgs
> = AdditionalArgs extends void
  ? BasePropsWithArgs<Loaders, AdditionalArgs>
  : PropsWithAdditionalArgs<Loaders, AdditionalArgs>;

interface Reload {
  reload: () => void;
}

export const AsyncView = function AsyncView<
  Loaders extends LoaderMap,
  AdditionalArgs = void
>(props: Props<Loaders, AdditionalArgs>) {
  const { Component, args, loaders, loadingElement } = props;
  const additionalArgs = ((
    props as PropsWithAdditionalArgs<Loaders, AdditionalArgs>
  ).additionalArgs ?? {}) as AdditionalArgs;

  const loaderContext = useLoaderContext();

  const [state, setState] = useState<Async<LoadedState<Loaders>>>(
    asyncUnloaded()
  );

  const doLoad = useCallback(
    async function load() {
      setState(asyncLoading);
      const promises: Promise<{ key: string; result: any }>[] = [];
      try {
        for (const entry of Object.entries(loaders)) {
          const key = entry[0];
          const loader = entry[1] as Loaders[typeof key];
          const doLoad = async () => {
            const result = await loader(loaderContext, (args as any)?.[key]);
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
        console.error(error);
        setState(asyncError(error.message));
      }
    },
    [args, loaders, loaderContext, setState]
  );

  useEffect(() => {
    doLoad();
  }, [doLoad]);

  if (isAsyncLoading(state)) {
    return loadingElement ?? <SpinnerOverlay />;
  } else if (isAsyncError(state)) {
    return (
      <Alert
        variant="light"
        color="red"
        title="Error"
        icon={<IconInfoCircle />}
      >
        {state.error}
      </Alert>
    );
  } else if (isAsyncLoaded(state)) {
    if (additionalArgs != null) {
      return <Component {...state.value} {...additionalArgs} reload={doLoad} />;
    }
  }
  return null;
};

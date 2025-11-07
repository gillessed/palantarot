import { useMemo, useState } from "react";
import { useApi } from "../apiProvider";
import { Async, asyncError, asyncLoaded, asyncLoading, asyncUnloaded } from "../utils/Async";

export type AsyncLoader<Result, Arg = void> = (arg: Arg) => Promise<Result>;

export function useAsync<Result, Arg = void>(loader: (arg: Arg) => Promise<Result>, onComplete?: (result: Result) => void) {
  const api = useApi();
  const [state, setState] = useState<Async<Result>>(asyncUnloaded());

  const request = useMemo(() => {
    return async function (arg: Arg) {
      setState(asyncLoading());
      try {
        const result = await loader(arg);
        setState(asyncLoaded(result));
        onComplete?.(result);
      } catch (error) {
        setState(asyncError(error));
      }
    };
  }, [api]);

  return { state, request };
}

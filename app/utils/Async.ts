export type AsyncUnloaded = { __async: "unloaded" };
export function asyncUnloaded(): AsyncUnloaded {
  return { __async: "unloaded" };
}
export function isAsyncUnloaded<T>(async: Async<T>): async is AsyncUnloaded {
  return async.__async === "unloaded";
}

export type AsyncLoading = { __async: "loading" };
export function asyncLoading(): AsyncLoading {
  return { __async: "loading" };
}
export function isAsyncLoading<T>(async: Async<T>): async is AsyncLoading {
  return async.__async === "loading";
}

export type AsyncReloading<T> = { __async: "reloading"; value: T };
export function asyncReloading<T>(value: T): AsyncReloading<T> {
  return { __async: "reloading", value };
}
export function isAsyncReloading<T>(async: Async<T>): async is AsyncReloading<T> {
  return async.__async === "reloading";
}

export type AsyncError = { __async: "error"; error: any };
export function asyncError(error: any): AsyncError {
  return { __async: "error", error };
}
export function isAsyncError<T>(async: Async<T>): async is AsyncError {
  return async.__async === "error";
}

export type AsyncLoaded<T> = { __async: "ready"; value: T };
export function asyncLoaded<T>(value: T): AsyncLoaded<T> {
  return { __async: "ready", value };
}
export function isAsyncLoaded<T>(async: Async<T>): async is AsyncLoaded<T> {
  return async.__async === "ready";
}

export type Async<T> = AsyncUnloaded | AsyncLoading | AsyncReloading<T> | AsyncError | AsyncLoaded<T>;

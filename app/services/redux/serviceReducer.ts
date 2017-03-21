import { Loadable, LoadableCache } from './loadable';
import { newTypedReducer } from './typedReducer';
import { LoadableServiceActions, LoadablePropertyActions } from './serviceActions';

export function generateServiceReducer<RESULT>(
  actions: LoadableServiceActions<string, RESULT>,
  reducerBuilder = newTypedReducer<LoadableCache<RESULT>>()
    .handleDefault((state = LoadableCache.create<RESULT>()) => state)) {
  function loadingReducer(
    cache: LoadableCache<RESULT>,
    keys: string[]) {
    return cache.keysLoading(...keys);
  }
  function successReducer(
    cache: LoadableCache<RESULT>,
    result: { arg: string[], result: Map<string, RESULT> }) {
    return cache.loaded(result.result);
  }
  function errorReducer(
    cache: LoadableCache<RESULT>,
    error: { arg: string[], error: Error }) {
    return cache.errored(error.arg, error.error);
  }
  function clearReducer(
    cache: LoadableCache<RESULT>,
    keys: string[]) {
    return cache.clear(...keys);
  }
  function clearAllReducer(cache: LoadableCache<RESULT>) {
    return cache.clearAll();
  }
  return reducerBuilder
    .handlePayload(actions.SUCCESS, successReducer)
    .handlePayload(actions.LOADING, loadingReducer)
    .handlePayload(actions.ERROR, errorReducer)
    .handlePayload(actions.CLEAR, clearReducer)
    .handlePayload(actions.CLEAR_ALL, clearAllReducer);
}

export function generatePropertyReducer<ARG, RESULT>(
  actions: LoadablePropertyActions<ARG, RESULT>,
  reducerBuilder = newTypedReducer<Loadable<RESULT>>()
    .handleDefault((state = { key: undefined, loading: false }) => state)) {
  function loadingReducer(state: Loadable<RESULT>, _: void) {
    return { ...state, loading: true };
  }
  function successReducer(state: Loadable<RESULT>, result: { arg: void, result: RESULT }) {
    return { key: state.key, loading: false, value: result.result, lastLoaded: new Date() };
  }
  function errorReducer(state: Loadable<RESULT>, result: { arg: void, error: Error }) {
    return { ...state, loading: false, error: result.error };
  }
  function clearReducer() {
    return { key: undefined, loading: false };
  }
  return reducerBuilder
    .handlePayload(actions.SUCCESS, successReducer)
    .handlePayload(actions.LOADING, loadingReducer)
    .handlePayload(actions.ERROR, errorReducer)
    .handlePayload(actions.CLEAR, clearReducer);
}
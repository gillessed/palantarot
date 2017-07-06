import { Loadable, LoadableCache } from './loadable';
import { newTypedReducer } from './typedReducer';
import { LoadableServiceActions, LoadablePropertyActions } from './serviceActions';

export function generateServiceReducer<ARG, RESULT>(
  actions: LoadableServiceActions<ARG, RESULT>,
  reducerBuilder = newTypedReducer<LoadableCache<ARG, RESULT>>()
    .handleDefault((state = LoadableCache.create<ARG, RESULT>()) => state)) {
  function loadingReducer(
    cache: LoadableCache<ARG, RESULT>,
    keys: ARG[]) {
    return cache.keysLoading(...keys);
  }
  function successReducer(
    cache: LoadableCache<ARG, RESULT>,
    result: { arg: ARG[], result: Map<ARG, RESULT> }) {
    return cache.loaded(result.result);
  }
  function errorReducer(
    cache: LoadableCache<ARG, RESULT>,
    error: { arg: ARG[], error: Error }) {
    return cache.errored(error.arg, error.error);
  }
  function clearReducer(
    cache: LoadableCache<ARG, RESULT>,
    keys: ARG[]) {
    return cache.clear(...keys);
  }
  function clearAllReducer(cache: LoadableCache<ARG, RESULT>) {
    return cache.clearAll();
  }
  return reducerBuilder
    .handlePayload(actions.SUCCESS, successReducer)
    .handlePayload(actions.LOADING, loadingReducer)
    .handlePayload(actions.ERROR, errorReducer)
    .handlePayload(actions.CLEAR, clearReducer)
    .handlePayload(actions.CLEAR_ALL, clearAllReducer);
}

export function generatePropertyReducer<RESULT>(
  actions: LoadablePropertyActions<void, RESULT>,
  reducerBuilder = newTypedReducer<Loadable<void, RESULT>>()
    .handleDefault((state = { key: undefined, loading: false }) => state)) {
  function loadingReducer(state: Loadable<void, RESULT>, _: void) {
    return { ...state, loading: true };
  }
  function successReducer(state: Loadable<void, RESULT>, result: { arg: void, result: RESULT }) {
    return { key: state.key, loading: false, value: result.result, lastLoaded: new Date() };
  }
  function errorReducer(state: Loadable<void, RESULT>, result: { arg: void, error: Error }) {
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
import { Loadable, LoadableCache } from './loadable';
import { TypedReducer } from 'redoodle';
import { ServiceActions, PropertyActions } from './serviceActions';
import { pageCacheAction } from '../pageCache/actions';

export function generateServiceReducer<ARG, RESULT, KEY = ARG>(
  actions: ServiceActions<ARG, RESULT>,
  argMapper: (arg: ARG) => KEY,
  reducerBuilder = TypedReducer.builder<LoadableCache<KEY, RESULT>>()
    .withDefaultHandler((state = LoadableCache.create<KEY, RESULT>()) => state)) {
  function loadingReducer(
    cache: LoadableCache<KEY, RESULT>,
    args: ARG[]) {
    return cache.keysLoading(...args.map(argMapper));
  }
  function successReducer(
    cache: LoadableCache<KEY, RESULT>,
    result: { arg: ARG[], result: Map<ARG, RESULT> }
  ) {
    const keyMap = new Map<KEY, RESULT>();
    result.result.forEach((result, arg) => {
      keyMap.set(argMapper(arg), result);
    });
    return cache.loaded(keyMap);
  }
  function errorReducer(
    cache: LoadableCache<KEY, RESULT>,
    error: { arg: ARG[], error: Error }) {
    return cache.errored(error.arg.map(argMapper), error.error);
  }
  function clearReducer(
    cache: LoadableCache<KEY, RESULT>,
    args: ARG[]) {
    return cache.clear(...args.map(argMapper));
  }
  function clearAllReducer(cache: LoadableCache<KEY, RESULT>) {
    return cache.clearAll();
  }
  function refreshCacheReducer(cache: LoadableCache<KEY, RESULT>) {
    return cache.refreshCache();
  }
  return reducerBuilder
    .withHandler(actions.success.TYPE, successReducer)
    .withHandler(actions.loading.TYPE, loadingReducer)
    .withHandler(actions.error.TYPE, errorReducer)
    .withHandler(actions.clear.TYPE, clearReducer)
    .withHandler(actions.clearAll.TYPE, clearAllReducer)
    .withHandler(pageCacheAction.TYPE, refreshCacheReducer);
}

export function generatePropertyReducer<ARG, RESULT>(
  actions: PropertyActions<ARG, RESULT>,
  reducerBuilder = TypedReducer.builder<Loadable<ARG, RESULT>>()
    .withDefaultHandler((state = { key: undefined, loading: false }) => state)) {
  function loadingReducer(state: Loadable<ARG, RESULT>) {
    return { ...state, loading: true };
  }
  function successReducer(state: Loadable<ARG, RESULT>, result: { arg: ARG, result: RESULT }) {
    return { key: result.arg, loading: false, value: result.result, lastLoaded: new Date(), cached: true };
  }
  function errorReducer(state: Loadable<ARG, RESULT>, result: { arg: ARG, error: Error }) {
    return { ...state, loading: false, error: result.error };
  }
  function clearReducer() {
    return { key: undefined, loading: false };
  }
  function refreshCacheReducer(state: Loadable<ARG, RESULT>) {
    return { ...state, cached: false };
  }
  return reducerBuilder
    .withHandler(actions.success.TYPE, successReducer)
    .withHandler(actions.loading.TYPE, loadingReducer)
    .withHandler(actions.error.TYPE, errorReducer)
    .withHandler(actions.clear.TYPE, clearReducer)
    .withHandler(pageCacheAction.TYPE, refreshCacheReducer);
}

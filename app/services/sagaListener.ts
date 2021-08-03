import { call, take, fork, cancel } from 'redux-saga/effects';
import { Task } from 'redux-saga';
import { TypedAction } from 'redoodle';

export interface SagaListener<PAYLOAD> {
  actionType: TypedAction.Definition<string, PAYLOAD>;
  callback: (payload: PAYLOAD) => void;
}

export const listenerLoop = function*(listeners: Set<SagaListener<any>>) {
  while (true) {

    const handlers: any[] = [];
    listeners.forEach((listener) => {
      const handler = function*() {
        while (true) {
          const action = yield take(listener.actionType.TYPE);
          yield call(listener.callback, action.payload);
        }
      };
      handlers.push(handler);
    });
    
    const forks: Task[] = [];
    for (let handler of handlers) {
      const listenerFork: Task = yield fork(handler);
      forks.push(listenerFork);
    }

    yield take(resetListeners.TYPE);

    for (let listenerFork of forks) {
      yield cancel(listenerFork);
    }
  }
};

export const resetListeners = TypedAction.define('LISTENERS // RESET')<void>();

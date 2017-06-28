import { ActionType, createActionType, createActionCreator } from './redux/typedAction';
import { call, take, fork, cancel } from 'redux-saga/effects';
import { Task } from 'redux-saga';

export interface SagaListener<PAYLOAD> {
  actionType: ActionType<PAYLOAD>;
  callback: (payload: PAYLOAD) => void;
}

export const listenerLoop = function*(listeners: Set<SagaListener<any>>) {
  while (true) {

    const handlers: any[] = [];
    listeners.forEach((listener) => {
      const handler = function*() {
        while (true) {
          const action = yield take(listener.actionType);
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

    yield take(LISTENER_RESET);

    for (let listenerFork of forks) {
      yield cancel(listenerFork);
    }
  }
};

export const LISTENER_RESET = createActionType<void>('LISTENERS // RESET');
export const resetListeners = createActionCreator<void>(LISTENER_RESET);